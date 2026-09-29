import React, { useEffect, useRef, useState } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertCircle,
  Crown,
  Shield,
  Monitor,
  MonitorOff,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';

export const GlobalCallModal: React.FC = () => {
  const {
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
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    flipCamera,
    startScreenShare,
    stopScreenShare,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Attach local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCall?.type, isVideoOff, isMinimized]);

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, activeCall?.status, isMinimized]);

  if (!activeCall) return null;

  const partner = isCaller ? activeCall.receiver : activeCall.caller;

  // Format call duration MM:SS or HH:MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Crown className="w-3 h-3 text-amber-400" />
            PROPRIÉTAIRE
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Shield className="w-3 h-3 text-emerald-400" />
            ADMIN
          </span>
        );
      case 'MODERATOR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Shield className="w-3 h-3 text-blue-400" />
            MODÉRATEUR
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">
            MEMBRE
          </span>
        );
    }
  };

  // 1. INCOMING CALL MODAL (Ringing on recipient's screen)
  if (isIncoming && activeCall.status === 'RINGING') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-white relative overflow-hidden flex flex-col items-center">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Call Type Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-semibold text-zinc-300 mb-6">
            {activeCall.type === 'VIDEO' ? (
              <>
                <Video className="w-3.5 h-3.5 text-indigo-400" />
                <span>Appel Vidéo Entrant</span>
              </>
            ) : (
              <>
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Appel Audio Entrant</span>
              </>
            )}
          </div>

          {/* Caller Avatar with Pulsing Rings */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping duration-1000" />
            <div className="absolute -inset-3 rounded-full border-2 border-emerald-400/40 animate-pulse" />
            <img
              src={partner.avatarUrl}
              alt={partner.displayName}
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 relative z-10 shadow-xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-white shadow-md">
              {activeCall.type === 'VIDEO' ? (
                <Video className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Caller Information */}
          <h2 className="text-xl font-black text-white tracking-tight mb-1">
            {partner.displayName}
          </h2>
          <p className="text-xs text-zinc-400 mb-2">@{partner.username}</p>
          <div className="mb-4">{getRoleBadge(partner.role)}</div>

          <p className="text-xs text-emerald-400 font-medium mb-8 animate-pulse">
            Sonnerie en cours... Votre ami(e) souhaite vous joindre.
          </p>

          {/* Big Action Buttons */}
          <div className="flex items-center justify-center gap-6 w-full max-w-xs">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                id="btn-decline-call"
                onClick={declineCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
                title="Décliner l'appel"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs font-semibold text-zinc-400">Décliner</span>
            </div>

            {/* Accept Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                id="btn-accept-call"
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-150 animate-bounce cursor-pointer"
                title="Accepter l'appel"
              >
                {activeCall.type === 'VIDEO' ? (
                  <Video className="w-7 h-7" />
                ) : (
                  <Phone className="w-7 h-7" />
                )}
              </button>
              <span className="text-xs font-semibold text-emerald-400">Accepter</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. MINIMIZED WIDGET (When minimized during active call)
  if (isMinimized && activeCall.status === 'ACCEPTED') {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 shadow-2xl flex items-center gap-3 text-white animate-in slide-in-from-bottom-4">
        <div className="relative">
          <img
            src={partner.avatarUrl}
            alt={partner.displayName}
            className="w-10 h-10 rounded-full object-cover border border-emerald-500"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full animate-pulse" />
        </div>
        <div className="text-left pr-2">
          <div className="text-xs font-bold leading-tight">{partner.displayName}</div>
          <div className="text-[10px] text-emerald-400 font-mono">
            {formatDuration(callDuration)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 border-l border-zinc-800 pl-2">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl text-xs transition-colors ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300"
            title="Agrandir l'appel"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={endCall}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-xl text-white"
            title="Raccrocher"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN CALL MODAL (Calling, Connected, or Ended state)
  const isVideoCall = activeCall.type === 'VIDEO';
  const isConnected = activeCall.status === 'ACCEPTED';
  const isDeclined = activeCall.status === 'DECLINED';
  const isEnded = activeCall.status === 'ENDED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`w-full ${
          isFullscreen ? 'h-full max-w-full' : isVideoCall ? 'max-w-4xl max-h-[92vh]' : 'max-w-md'
        } bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative transition-all duration-200`}
      >
        {/* Header Bar */}
        <div className="p-4 sm:px-6 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={partner.avatarUrl}
                alt={partner.displayName}
                className="w-9 h-9 rounded-xl object-cover border border-zinc-700"
                referrerPolicy="no-referrer"
              />
              {isConnected && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
              )}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <span>{partner.displayName}</span>
                {getRoleBadge(partner.role)}
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                {isConnected ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En ligne • {formatDuration(callDuration)}
                  </span>
                ) : isDeclined ? (
                  <span className="text-red-400 font-sans font-medium">Appel refusé</span>
                ) : isEnded ? (
                  <span className="text-zinc-400 font-sans font-medium">Appel terminé</span>
                ) : (
                  <span className="text-amber-400 font-sans font-medium animate-pulse">
                    Appel en cours... Sonnerie
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                title="Réduire"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
            {isVideoCall && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notices & Camera Warnings */}
        {(notice || cameraError) && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{notice || cameraError}</span>
          </div>
        )}

        {/* Screen Sharing Indicator Banner */}
        {isScreenSharing && (
          <div className="mx-4 mt-2 px-3.5 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span className="font-semibold">Vous partagez votre écran avec le correspondant</span>
            </div>
            <button
              onClick={stopScreenShare}
              className="px-2.5 py-1 rounded-lg bg-teal-500 text-zinc-950 text-[11px] font-bold hover:bg-teal-400 transition-colors"
            >
              Arrêter
            </button>
          </div>
        )}

        {/* Video / Audio Stage */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] sm:min-h-[400px] bg-zinc-950">
          {isVideoCall ? (
            /* VIDEO CALL STAGE */
            <div className="w-full h-full min-h-[320px] rounded-2xl bg-zinc-900 border border-zinc-800/80 relative overflow-hidden flex items-center justify-center">
              {/* Remote Video Stream (Main Feed) */}
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Fallback Partner Stage if remote stream not yet negotiated */
                <div className="flex flex-col items-center space-y-4 p-6 text-center">
                  <div className="relative">
                    <img
                      src={partner.avatarUrl}
                      alt={partner.displayName}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-zinc-700 shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                    {isConnected && (
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/50 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {partner.displayName}
                    </h3>
                    <p className="text-xs text-zinc-400">@{partner.username}</p>
                    <p className="text-xs text-indigo-400 mt-2 font-medium">
                      {isConnected
                        ? 'Connecté en communication vidéo sécurisée'
                        : 'En attente de connexion du correspondant...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Local Video Stream Preview (Self Camera Feed) */}
              <div className="absolute bottom-4 right-4 w-32 sm:w-48 aspect-video rounded-2xl bg-zinc-950 border-2 border-zinc-700 shadow-2xl overflow-hidden group">
                {!isVideoOff && localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-2 text-zinc-400">
                    <VideoOff className="w-5 h-5 text-zinc-500 mb-1" />
                    <span className="text-[10px] font-medium">Caméra désactivée</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-2 text-[9px] bg-black/70 text-white font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                  Vous {isMuted && '• Muet'}
                </div>
              </div>
            </div>
          ) : (
            /* AUDIO CALL STAGE */
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              {/* Glowing Partner Avatar */}
              <div className="relative">
                {isConnected && (
                  <>
                    <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-ping duration-1000" />
                    <div className="absolute -inset-2 rounded-full border-2 border-emerald-500/30 animate-pulse" />
                  </>
                )}
                <img
                  src={partner.avatarUrl}
                  alt={partner.displayName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/60 shadow-2xl relative z-10"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full bg-emerald-500 border-2 border-zinc-900 flex items-center justify-center text-white shadow-md">
                  <Phone className="w-4 h-4" />
                </span>
              </div>

              {/* Name & Status */}
              <div className="text-center">
                <h3 className="text-xl font-black text-white">{partner.displayName}</h3>
                <p className="text-xs text-zinc-400">@{partner.username}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Audio HD Chiffré</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-400 animate-pulse font-medium">
                      Appel en cours... Sonnerie
                    </span>
                  )}
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              {isConnected && (
                <div className="flex items-center gap-1 h-8">
                  {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35, 75].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${isMuted ? 8 : Math.max(8, h * 0.28)}px` }}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-150 animate-pulse"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* In-Call Action Control Bar */}
        <div className="p-4 sm:p-5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-center gap-4 sm:gap-6 shrink-0">
          {/* Mute Microphone Button */}
          <button
            id="btn-toggle-mute"
            onClick={toggleMute}
            className={`p-3.5 sm:p-4 rounded-full transition-all duration-150 cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle Button (If Video Call) */}
          {isVideoCall && (
            <button
              id="btn-toggle-video"
              onClick={toggleVideo}
              className={`p-3.5 sm:p-4 rounded-full transition-all duration-150 cursor-pointer ${
                isVideoOff
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
              title={isVideoOff ? 'Activer la caméra' : 'Couper la caméra'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Screen Sharing Button (If Video Call) */}
          {isVideoCall && (
            <button
              id="btn-toggle-screen-share"
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className={`p-3.5 sm:p-4 rounded-full transition-all duration-150 cursor-pointer flex items-center justify-center ${
                isScreenSharing
                  ? 'bg-teal-500 text-zinc-950 font-bold shadow-lg shadow-teal-500/40 hover:bg-teal-400'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
              title={isScreenSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
            >
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </button>
          )}

          {/* Flip / Switch Camera Button (If Video Call) */}
          {isVideoCall && (
            <button
              onClick={flipCamera}
              className="p-3.5 sm:p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer"
              title="Changer de caméra"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* Hangup / End Call Button */}
          <button
            id="btn-end-call"
            onClick={endCall}
            className="p-3.5 sm:p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
            title="Raccrocher l'appel"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
