import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User, CallSession, CallType } from '../types';
import { api } from '../api';

class SoundEffects {
  private ctx: AudioContext | null = null;
  private ringInterval: any = null;

  private getContext() {
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playIncomingRing() {
    this.stopRinging();
    const playChime = () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.33);
        } catch {}
      });
    };
    playChime();
    this.ringInterval = setInterval(playChime, 2500);
  }

  playOutgoingRing() {
    this.stopRinging();
    const playBeep = () => {
      const ctx = this.getContext();
      if (!ctx) return;
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.1);
        osc2.stop(ctx.currentTime + 1.1);
      } catch {}
    };
    playBeep();
    this.ringInterval = setInterval(playBeep, 2800);
  }

  stopRinging() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  playEndCall() {
    this.stopRinging();
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.31);
    } catch {}
  }
}

const soundManager = new SoundEffects();

interface CallContextType {
  activeCall: CallSession | null;
  currentUser: User | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  notice: string | null;
  cameraError: string | null;
  isIncoming: boolean;
  isCaller: boolean;
  isScreenSharing: boolean;
  startCall: (targetUserId: string, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  flipCamera: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

interface CallProviderProps {
  children: React.ReactNode;
  currentUser: User | null;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children, currentUser }) => {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const durationTimerRef = useRef<any>(null);
  const pollTimerRef = useRef<any>(null);
  const signalPollTimerRef = useRef<any>(null);
  const lastSignalTimestampRef = useRef<number>(0);
  const isCleaningUpRef = useRef<boolean>(false);

  const isIncoming = Boolean(
    activeCall &&
    currentUser &&
    activeCall.receiverId === currentUser.id &&
    activeCall.status === 'RINGING'
  );

  const isCaller = Boolean(
    activeCall &&
    currentUser &&
    activeCall.callerId === currentUser.id
  );

  // Stop local tracks cleanly
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      setLocalStream(null);
    }
  }, [localStream]);

  // Cleanup WebRTC connection
  const closePeerConnection = useCallback(() => {
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    setRemoteStream(null);
  }, []);

  // Initialize or acquire media stream (camera / microphone)
  const acquireMedia = async (type: CallType): Promise<MediaStream | null> => {
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'VIDEO' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setIsMuted(false);
      setIsVideoOff(false);
      return stream;
    } catch (err: any) {
      console.warn('Media access warning:', err);
      // Fallback: If camera access was denied or absent in video call, attempt audio only
      if (type === 'VIDEO') {
        try {
          setCameraError("Caméra indisponible ou permission refusée. Passage en audio.");
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setLocalStream(audioStream);
          setIsVideoOff(true);
          return audioStream;
        } catch (audioErr: any) {
          setCameraError("Impossible d'accéder au microphone ou à la caméra.");
          return null;
        }
      }
      setCameraError("Impossible d'accéder au microphone.");
      return null;
    }
  };

  // Setup WebRTC peer connection
  const initPeerConnection = (stream: MediaStream | null, isInitiator: boolean, callId: string) => {
    closePeerConnection();

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });
    pcRef.current = pc;

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        api.sendCallSignal(callId, 'ice-candidate', event.candidate).catch(() => {});
      }
    };

    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (pc.localDescription) {
            api.sendCallSignal(callId, 'offer', pc.localDescription).catch(() => {});
          }
        })
        .catch((err) => console.error('Error creating offer:', err));
    }

    return pc;
  };

  // Poll WebRTC signals while call is active
  useEffect(() => {
    if (activeCall && activeCall.status === 'ACCEPTED') {
      const callId = activeCall.id;
      lastSignalTimestampRef.current = 0;

      signalPollTimerRef.current = setInterval(async () => {
        try {
          const res = await api.getCallSignals(callId, lastSignalTimestampRef.current);
          if (res && res.signals && res.signals.length > 0) {
            for (const sig of res.signals) {
              if (sig.timestamp > lastSignalTimestampRef.current) {
                lastSignalTimestampRef.current = sig.timestamp;
              }
              const pc = pcRef.current;
              if (!pc) continue;

              if (sig.type === 'offer' && !isCaller) {
                await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await api.sendCallSignal(callId, 'answer', answer);
              } else if (sig.type === 'answer' && isCaller) {
                if (pc.signalingState === 'have-local-offer') {
                  await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                }
              } else if (sig.type === 'ice-candidate' && sig.payload) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(sig.payload));
                } catch {}
              }
            }
          }
        } catch {}
      }, 1200);

      return () => {
        if (signalPollTimerRef.current) clearInterval(signalPollTimerRef.current);
      };
    } else {
      if (signalPollTimerRef.current) clearInterval(signalPollTimerRef.current);
    }
  }, [activeCall?.id, activeCall?.status, isCaller]);

  // Duration Timer for Connected Call
  useEffect(() => {
    if (activeCall && activeCall.status === 'ACCEPTED') {
      setCallDuration(0);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [activeCall?.status]);

  // Sound and Tone Handling (Ringing, Decline, End)
  useEffect(() => {
    if (!activeCall) {
      soundManager.stopRinging();
      return;
    }

    if (activeCall.status === 'RINGING') {
      if (isIncoming) {
        soundManager.playIncomingRing();
      } else if (isCaller) {
        soundManager.playOutgoingRing();
      }
    } else {
      soundManager.stopRinging();
      if (activeCall.status === 'DECLINED' || activeCall.status === 'ENDED') {
        soundManager.playEndCall();
      }
    }

    return () => {
      soundManager.stopRinging();
    };
  }, [activeCall?.status, isIncoming, isCaller]);

  // Poll current active calls from server
  useEffect(() => {
    if (!currentUser) {
      setActiveCall(null);
      stopLocalStream();
      closePeerConnection();
      return;
    }

    const checkCalls = async () => {
      try {
        const res = await api.getCurrentCall();
        const serverCall = res.call || null;

        setActiveCall((prev) => {
          // If a call transitioned to DECLINED or ENDED, show notice and close gracefully after 2.5s
          if (serverCall) {
            if (serverCall.status === 'DECLINED') {
              setNotice('Appel refusé par votre correspondant.');
              setTimeout(() => {
                setActiveCall(null);
                setNotice(null);
                stopLocalStream();
                closePeerConnection();
              }, 2500);
            } else if (serverCall.status === 'ENDED' && prev?.status === 'ACCEPTED') {
              setNotice('Appel terminé.');
              setTimeout(() => {
                setActiveCall(null);
                setNotice(null);
                stopLocalStream();
                closePeerConnection();
              }, 2000);
            }
            return serverCall;
          } else {
            // No active call on server, if we had one that wasn't already ending, clear it
            if (prev && prev.status !== 'DECLINED' && prev.status !== 'ENDED') {
              stopLocalStream();
              closePeerConnection();
            }
            return null;
          }
        });
      } catch {
        // Silent poll error handling
      }
    };

    checkCalls();
    pollTimerRef.current = setInterval(checkCalls, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [currentUser?.id, stopLocalStream, closePeerConnection]);

  // When call becomes ACCEPTED, if localStream exists, ensure peer connection is active
  useEffect(() => {
    if (activeCall && activeCall.status === 'ACCEPTED') {
      if (!pcRef.current) {
        initPeerConnection(localStream, isCaller, activeCall.id);
      }
    }
  }, [activeCall?.status, localStream, isCaller]);

  // 1. Start a Call (Caller)
  const startCall = async (targetUserId: string, type: CallType) => {
    if (!currentUser) return;
    setNotice(null);
    setCameraError(null);

    // If VIDEO call: Immediately activate camera so caller can see themselves right away!
    const stream = await acquireMedia(type);

    try {
      const res = await api.startCall(targetUserId, type);
      setActiveCall(res.call);
      // Init peer connection as initiator
      initPeerConnection(stream, true, res.call.id);
    } catch (err: any) {
      setNotice(err.message || "Impossible de démarrer l'appel.");
      stopLocalStream();
      closePeerConnection();
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // 2. Accept a Call (Receiver)
  const acceptCall = async () => {
    if (!activeCall) return;
    soundManager.stopRinging();

    // If VIDEO call: Activate camera immediately on accept!
    const stream = await acquireMedia(activeCall.type);

    try {
      const res = await api.acceptCall(activeCall.id);
      setActiveCall(res.call);
      // Init peer connection as responder
      initPeerConnection(stream, false, res.call.id);
    } catch (err: any) {
      setNotice(err.message || "Erreur lors de l'acceptation de l'appel.");
      stopLocalStream();
      closePeerConnection();
    }
  };

  // 3. Decline a Call (Receiver)
  const declineCall = async () => {
    if (!activeCall) return;
    soundManager.stopRinging();
    soundManager.playEndCall();
    const callId = activeCall.id;
    setActiveCall((prev) => (prev ? { ...prev, status: 'DECLINED' } : null));
    stopLocalStream();
    closePeerConnection();
    try {
      await api.declineCall(callId);
    } catch {}
    setTimeout(() => {
      setActiveCall(null);
    }, 1200);
  };

  // 4. End a Call (Caller or Receiver)
  const endCall = async () => {
    if (!activeCall) return;
    soundManager.stopRinging();
    soundManager.playEndCall();
    const callId = activeCall.id;
    setActiveCall((prev) => (prev ? { ...prev, status: 'ENDED' } : null));
    stopLocalStream();
    closePeerConnection();
    try {
      await api.endCall(callId);
    } catch {}
    setTimeout(() => {
      setActiveCall(null);
    }, 1200);
  };

  // Controls: Mute Microphone
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  // Controls: Toggle Video / Camera
  const toggleVideo = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      } else {
        // If no video track was running, try to acquire camera
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          const newTrack = newStream.getVideoTracks()[0];
          localStream.addTrack(newTrack);
          if (pcRef.current) {
            pcRef.current.addTrack(newTrack, localStream);
          }
          setIsVideoOff(false);
        } catch {
          setCameraError("Impossible d'activer la caméra.");
        }
      }
    } else {
      setIsVideoOff((prev) => !prev);
    }
  };

  // Controls: Flip camera
  const flipCamera = async () => {
    if (!localStream) return;
    try {
      const currentFacing = 'user';
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacing === 'user' ? 'environment' : 'user' },
        audio: false,
      });
      const newTrack = newStream.getVideoTracks()[0];
      const oldTrack = localStream.getVideoTracks()[0];
      if (oldTrack) {
        localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }
      localStream.addTrack(newTrack);
      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      }
    } catch {}
  };

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalCameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const startScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setCameraError("Le partage d'écran n'est pas supporté par ce navigateur.");
      return;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = displayStream;
      const screenTrack = displayStream.getVideoTracks()[0];

      if (screenTrack) {
        if (localStream) {
          const oldVideoTrack = localStream.getVideoTracks()[0];
          if (oldVideoTrack) {
            originalCameraTrackRef.current = oldVideoTrack;
            localStream.removeTrack(oldVideoTrack);
          }
          localStream.addTrack(screenTrack);
        }

        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        setIsScreenSharing(true);

        // When user stops sharing from browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setCameraError("Impossible d'activer le partage d'écran.");
      }
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);

    // Revert to camera track
    let replacementTrack = originalCameraTrackRef.current;
    if (!replacementTrack || replacementTrack.readyState === 'ended') {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        replacementTrack = camStream.getVideoTracks()[0];
      } catch {
        replacementTrack = null;
      }
    }

    if (replacementTrack && localStream) {
      const currentVideoTrack = localStream.getVideoTracks()[0];
      if (currentVideoTrack) {
        localStream.removeTrack(currentVideoTrack);
      }
      localStream.addTrack(replacementTrack);

      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(replacementTrack);
        }
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        currentUser,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        callDuration,
        notice,
        cameraError,
        isIncoming,
        isCaller,
        isScreenSharing,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,
        flipCamera,
        startScreenShare,
        stopScreenShare,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
