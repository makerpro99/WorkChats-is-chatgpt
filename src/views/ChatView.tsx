import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Flag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  User as UserIcon,
  Users,
  Shield,
  Crown,
  Copy,
  Check,
  ArrowLeft,
  Phone,
  Video,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  FileAudio,
  FileVideo,
  FileCode,
  File as FileGeneric,
  Download,
  Smile,
  CheckCheck,
  ExternalLink,
  ZoomIn,
  Trash2,
  Mic,
  MicOff,
} from 'lucide-react';
import { User, ChatMessage, ChatAttachment, LinkPreview } from '../types';
import { api } from '../api';
import { useCall } from '../context/CallContext';

interface ChatViewProps {
  currentUser: User;
  friends: User[];
  onOpenReportModal: (targetType: 'MESSAGE' | 'USER', id: string, name: string, content?: string) => void;
  initialPartner?: User | null;
}

type FilterTab = 'FRIENDS';

const QUICK_EMOJIS = ['👍', '❤️', '😊', '🎉', '🔥', '💡', '🚀', '👏', '🤝', '🙏'];

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  friends,
  onOpenReportModal,
  initialPartner,
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeTab] = useState<FilterTab>('FRIENDS');
  const [selectedPartner, setSelectedPartner] = useState<User | null>(initialPartner || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // File attachments state
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Typing & Emojis
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Zoomed Image Lightbox
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API Voice Dictation
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'fr-FR';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript.trim()) {
            setMessageInput((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('La reconnaissance vocale (Web Speech API) n’est pas disponible sur ce navigateur.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech start error:', err);
        setIsListening(false);
      }
    }
  };

  // Real-time Audio & Video call integration
  const { startCall } = useCall();

  const handleStartCall = async (type: 'AUDIO' | 'VIDEO') => {
    if (!selectedPartner) return;
    try {
      await startCall(selectedPartner.id, type);
    } catch (err: any) {
      setError(err.message || "Impossible de démarrer l'appel.");
    }
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync initial partner if changed
  useEffect(() => {
    if (initialPartner) {
      setSelectedPartner(initialPartner);
    }
  }, [initialPartner]);

  // Helper to deduplicate messages by ID
  const deduplicateMessages = (msgList: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<string>();
    const result: ChatMessage[] = [];
    for (const m of msgList) {
      if (m && m.id && !seen.has(m.id)) {
        seen.add(m.id);
        result.push(m);
      }
    }
    return result;
  };

  // Load messages
  const loadMessages = async (partnerId: string, isSilent = false) => {
    if (!isSilent) {
      setLoadingMessages(true);
      setError(null);
    }
    try {
      const res = await api.getChatMessages(partnerId);
      setMessages(deduplicateMessages(res.messages || []));
      if (res.partner) {
        setSelectedPartner(res.partner);
      }
    } catch (err: any) {
      if (!isSilent) {
        setError(err.message || 'Impossible de charger les messages.');
      }
    } finally {
      if (!isSilent) {
        setLoadingMessages(false);
      }
    }
  };

  // Poll messages and typing indicator
  useEffect(() => {
    if (selectedPartner) {
      loadMessages(selectedPartner.id, false);
      const interval = setInterval(() => {
        loadMessages(selectedPartner.id, true);
        api.getTypingStatus(selectedPartner.id)
          .then((res) => setPartnerIsTyping(res.isTyping))
          .catch(() => {});
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [selectedPartner?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending, pendingAttachments.length]);

  // File Upload Handler
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(15);
    setError(null);

    const uploadedList: ChatAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Max size: 25MB
      if (file.size > 25 * 1024 * 1024) {
        setError(`Le fichier "${file.name}" dépasse la limite maximale de 25 Mo.`);
        continue;
      }

      try {
        setUploadProgress(Math.min(90, 25 + Math.round(((i + 1) / files.length) * 60)));
        const base64Data = await readFileAsBase64(file);
        const res = await api.uploadChatAttachment({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          base64Data,
        });

        if (res && res.attachment) {
          uploadedList.push(res.attachment);
        }
      } catch (err: any) {
        setError(err.message || `Échec du téléversement de ${file.name}`);
      }
    }

    setPendingAttachments((prev) => [...prev, ...uploadedList]);
    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 400);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  // URL extraction for link previews
  const extractUrls = (text: string): string[] => {
    const regex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const matches = text.match(regex) || [];
    return matches.map((m) => (m.startsWith('http') ? m : `https://${m}`));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (selectedPartner) {
      api.sendTypingIndicator(selectedPartner.id, true).catch(() => {});
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedPartner) {
          api.sendTypingIndicator(selectedPartner.id, false).catch(() => {});
        }
      }, 3000);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : messageInput).trim();
    const hasAttachments = pendingAttachments.length > 0;

    if ((!text && !hasAttachments) || !selectedPartner || sending) return;

    if (textToSend === undefined) {
      setMessageInput('');
    }
    const attachmentsToSend = [...pendingAttachments];
    setPendingAttachments([]);
    setSending(true);
    setError(null);

    // Parse link preview if text has URLs
    let linkPreviews: LinkPreview[] = [];
    const urls = extractUrls(text);
    if (urls.length > 0) {
      try {
        const previewRes = await api.parseLinkPreview(urls[0]);
        if (previewRes && previewRes.preview) {
          linkPreviews = [previewRes.preview];
        }
      } catch {}
    }

    try {
      const res = await api.sendMessage(
        selectedPartner.id,
        text,
        attachmentsToSend.length ? attachmentsToSend : undefined,
        linkPreviews.length ? linkPreviews : undefined
      );

      setMessages((prev) => {
        const toAdd = res.replyMessage ? [res.message, res.replyMessage] : [res.message];
        return deduplicateMessages([...prev, ...toAdd]);
      });
      loadConversations();
    } catch (err: any) {
      setError(err.message || 'Impossible d\'envoyer le message.');
      // Restore attachments if sending failed
      if (attachmentsToSend.length) {
        setPendingAttachments(attachmentsToSend);
      }
    } finally {
      setSending(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Friends list calculation
  const friendsList = (friends || []).filter((f) => f.id !== 'usr_ai_gemini' && f.id !== currentUser.id);
  const isPartnerFriend = Boolean(
    selectedPartner &&
    friendsList.some((f) => f.id === selectedPartner.id || f.username === selectedPartner.username)
  );

  const q = searchQuery.trim().toLowerCase();
  const filteredUsers = friendsList.filter((u) => {
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            <Crown className="w-2.5 h-2.5 text-amber-600" />
            OWNER
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Shield className="w-2.5 h-2.5 text-indigo-600" />
            ADMIN
          </span>
        );
      case 'MODERATOR':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-purple-50 text-purple-800 border border-purple-200">
            <Shield className="w-2.5 h-2.5 text-purple-600" />
            MOD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
            MEMBRE
          </span>
        );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Render link with instant teleport navigation
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\/(?:owner|creator|users|chat|tasks|teams|work|announcements|settings|friends|notifications)(?:\/[^\s]*)?)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
      if (part.match(urlRegex)) {
        const fullUrl = part.startsWith('/') ? part : part.startsWith('http') ? part : `https://${part}`;
        const isInternalRoute = fullUrl.startsWith('/') || fullUrl.startsWith(window.location.origin);

        const handleTeleportClick = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (isInternalRoute) {
            const targetPath = fullUrl.startsWith('/') ? fullUrl : fullUrl.replace(window.location.origin, '');
            window.history.pushState(null, '', targetPath);
            window.dispatchEvent(new PopStateEvent('popstate'));
          } else {
            try {
              const win = window.open(fullUrl, '_blank', 'noopener,noreferrer');
              if (!win) {
                window.location.href = fullUrl;
              }
            } catch {
              window.location.href = fullUrl;
            }
          }
        };

        return (
          <a
            key={idx}
            href={fullUrl}
            onClick={handleTeleportClick}
            title={`Teleport to ${fullUrl}`}
            className="inline-flex items-center gap-1 underline text-teal-300 hover:text-white font-semibold break-all cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-teal-500/20"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0 opacity-80" />
          </a>
        );
      }

      // Render bold **text**
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx}>
          {boldParts.map((bp, bIdx) => {
            if (bp.startsWith('**') && bp.endsWith('**')) {
              return (
                <strong key={bIdx} className="font-bold">
                  {bp.slice(2, -2)}
                </strong>
              );
            }
            return bp;
          })}
        </span>
      );
    });
  };

  // Render Markdown / Code Blocks
  const renderMessageContent = (content: string, isMe: boolean) => {
    if (content.includes('```')) {
      const parts = content.split(/(```[\s\S]*?```)/g);
      return (
        <div className="space-y-2">
          {parts.map((part, idx) => {
            if (part.startsWith('```') && part.endsWith('```')) {
              const lines = part.slice(3, -3).trim().split('\n');
              const firstLine = lines[0].trim();
              const lang = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
              const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
              const codeId = `code_${idx}_${code.slice(0, 10)}`;

              return (
                <div
                  key={idx}
                  className="my-2 rounded-xl overflow-hidden bg-zinc-950 text-zinc-100 text-[11px] font-mono border border-zinc-800 shadow-sm"
                >
                  <div className="px-3 py-1.5 bg-zinc-900 flex items-center justify-between border-b border-zinc-800 text-[10px] text-zinc-400">
                    <span className="font-semibold uppercase tracking-wider text-teal-400">
                      {lang || 'Code'}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(code, codeId)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedCodeId === codeId ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 overflow-x-auto leading-relaxed whitespace-pre font-mono">
                    {code}
                  </pre>
                </div>
              );
            }
            return (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {renderTextWithLinks(part)}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {renderTextWithLinks(content)}
      </div>
    );
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="bg-white rounded-3xl border border-zinc-200 shadow-xs flex h-[calc(100vh-8.5rem)] overflow-hidden relative"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-teal-600/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-150">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mb-4 animate-bounce">
            <Paperclip className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-black">Déposez vos fichiers ici</h3>
          <p className="text-xs text-teal-100 mt-1 max-w-sm text-center">
            Images, vidéos, audio, PDF, documents, feuilles de calcul ou archives ZIP
          </p>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-3 flex items-center gap-3">
              <a
                href={zoomedImage}
                download="workchat_image.png"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger l'image</span>
              </a>
              <button
                onClick={() => setZoomedImage(null)}
                className="px-4 py-2 bg-white text-zinc-900 text-xs font-bold rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files) handleFileUpload(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* LEFT SIDEBAR: Friends / Contacts List */}
      <div
        className={`w-full md:w-80 border-r border-zinc-200 flex flex-col bg-zinc-50/50 shrink-0 ${
          selectedPartner ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-zinc-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Messagerie Directe</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
              {friendsList.length} ami(s)
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-zinc-100 border border-transparent rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-300 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Friends & Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2 space-y-1">
          {filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-xs">
              <UserIcon className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p className="font-semibold text-zinc-600">Aucun contact trouvé</p>
              <p className="text-[11px] mt-1 text-zinc-400">
                Ajoutez des collègues dans la section « Amis » pour démarrer une conversation.
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedPartner?.id === user.id;
              const conv = conversations.find(
                (c) => c.partner && c.partner.id === user.id
              );
              const unread = conv?.unreadCount || 0;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedPartner(user)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'hover:bg-white text-zinc-900'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ${
                        isSelected ? 'ring-zinc-900' : 'ring-white'
                      } ${user.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">
                        {user.displayName}
                      </span>
                      {unread > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-teal-500 text-zinc-950 font-black text-[10px] rounded-full shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[11px] truncate flex items-center gap-1 ${
                        isSelected ? 'text-zinc-300' : 'text-zinc-400'
                      }`}
                    >
                      <span>@{user.username}</span>
                      <span>•</span>
                      <span>{user.status === 'ONLINE' ? 'En ligne' : 'Absent'}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Active Conversation View */}
      <div
        className={`flex-1 flex flex-col bg-white overflow-hidden ${
          selectedPartner ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedPartner ? (
          <>
            {/* Chat Top Header */}
            <div className="h-16 px-5 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="md:hidden p-1.5 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <img
                    src={selectedPartner.avatarUrl}
                    alt={selectedPartner.displayName}
                    className="w-9 h-9 rounded-xl object-cover border border-zinc-200"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      selectedPartner.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-300'
                    }`}
                  />
                </div>

                <div>
                  <div className="text-xs font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <span>{selectedPartner.displayName}</span>
                    <span className="text-zinc-400 font-normal">
                      (@{selectedPartner.username})
                    </span>
                    {getRoleBadge(selectedPartner.role)}
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <span>
                      {selectedPartner.status === 'ONLINE'
                        ? '🟢 Actif actuellement'
                        : '⚪ Hors ligne'}
                    </span>
                    {partnerIsTyping && (
                      <span className="text-teal-600 font-semibold flex items-center gap-1 ml-1 animate-pulse">
                        <span>• est en train d'écrire...</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Voice and Video Calls */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-voice-call"
                  onClick={() => handleStartCall('AUDIO')}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                  title="Lancer un appel vocal (Microphone HD)"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Appel Vocal</span>
                </button>

                <button
                  id="btn-video-call"
                  onClick={() => handleStartCall('VIDEO')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                  title="Lancer un appel vidéo avec partage d'écran WebRTC"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Appel Vidéo</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="m-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-50/20">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-zinc-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Chargement de l'historique sécurisé...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-zinc-400 text-xs">
                  <MessageSquare className="w-12 h-12 text-zinc-300 mb-2" />
                  <p className="font-bold text-zinc-700 text-sm">Démarrez votre conversation</p>
                  <p className="mt-1 max-w-xs text-zinc-400">
                    Envoyez un message texte, importez des fichiers ou passez un appel en temps réel avec {selectedPartner.displayName}.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser.id;
                  const safeKey = msg.id ? `${msg.id}_${index}` : `msg_idx_${index}_${msg.timestamp || ''}`;
                  const hasAtt = msg.attachments && msg.attachments.length > 0;
                  const hasPreviews = msg.linkPreviews && msg.linkPreviews.length > 0;

                  return (
                    <div
                      key={safeKey}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%] sm:max-w-[75%]">
                        {!isMe && (
                          <div className="shrink-0 mb-1">
                            <img
                              src={selectedPartner.avatarUrl}
                              alt={selectedPartner.displayName}
                              className="w-7 h-7 rounded-lg object-cover border border-zinc-200"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <div className="flex-1 space-y-1.5">
                          {!isMe && (
                            <div className="text-[10px] font-bold text-zinc-500 ml-1">
                              {selectedPartner.displayName}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-xs shadow-2xs space-y-2.5 ${
                              isMe
                                ? 'bg-zinc-900 text-white rounded-br-xs'
                                : 'bg-white border border-zinc-200/90 text-zinc-900 rounded-bl-xs'
                            }`}
                          >
                            {/* Text content */}
                            {msg.content && renderMessageContent(msg.content, isMe)}

                            {/* Attachments rendering */}
                            {hasAtt && (
                              <div className="space-y-2 pt-1">
                                {msg.attachments!.map((att) => {
                                  const isImg = att.type.startsWith('image/');
                                  const isVid = att.type.startsWith('video/');
                                  const isAud = att.type.startsWith('audio/');
                                  const isPdf = att.type === 'application/pdf' || att.name.toLowerCase().endsWith('.pdf');

                                  if (isImg) {
                                    return (
                                      <div key={att.id} className="relative group/img rounded-xl overflow-hidden border border-white/20">
                                        <img
                                          src={att.url}
                                          alt={att.name}
                                          className="max-h-60 max-w-full rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                          onClick={() => setZoomedImage(att.url)}
                                        />
                                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => setZoomedImage(att.url)}
                                            className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                                            title="Agrandir l'image"
                                          >
                                            <ZoomIn className="w-3.5 h-3.5" />
                                          </button>
                                          <a
                                            href={att.url}
                                            download={att.name}
                                            className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                                            title="Télécharger"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (isVid) {
                                    return (
                                      <div key={att.id} className="rounded-xl overflow-hidden bg-black max-w-xs">
                                        <video src={att.url} controls className="w-full rounded-xl max-h-56" />
                                      </div>
                                    );
                                  }

                                  if (isAud) {
                                    return (
                                      <div key={att.id} className="p-2 rounded-xl bg-zinc-800 text-white max-w-xs">
                                        <div className="text-[10px] truncate mb-1 text-zinc-300">🎵 {att.name}</div>
                                        <audio src={att.url} controls className="w-full h-8" />
                                      </div>
                                    );
                                  }

                                  // Generic File / PDF
                                  return (
                                    <div
                                      key={att.id}
                                      className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${
                                        isMe
                                          ? 'bg-zinc-800/80 border-zinc-700 text-white'
                                          : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 shrink-0">
                                          {isPdf ? (
                                            <FileText className="w-4 h-4 text-rose-400" />
                                          ) : (
                                            <FileGeneric className="w-4 h-4" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-bold truncate">{att.name}</div>
                                          <div className="text-[10px] text-zinc-400">
                                            {formatFileSize(att.size)}
                                          </div>
                                        </div>
                                      </div>

                                      <a
                                        href={att.url}
                                        download={att.name}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-teal-300 hover:text-white transition-colors shrink-0"
                                        title="Télécharger le fichier"
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Link Previews */}
                            {hasPreviews && (
                              <div className="space-y-1.5 pt-1">
                                {msg.linkPreviews!.map((preview, pIdx) => (
                                  <a
                                    key={pIdx}
                                    href={preview.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block rounded-xl border p-2.5 transition-colors ${
                                      isMe
                                        ? 'bg-zinc-800/90 border-zinc-700 hover:bg-zinc-800'
                                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      {preview.image && (
                                        <img
                                          src={preview.image}
                                          alt=""
                                          className="w-4 h-4 rounded-sm object-contain"
                                        />
                                      )}
                                      <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
                                        {preview.siteName || preview.domain}
                                      </span>
                                    </div>
                                    <div className="text-xs font-bold truncate text-white">
                                      {preview.title || preview.url}
                                    </div>
                                    {preview.description && (
                                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                                        {preview.description}
                                      </p>
                                    )}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {!isMe && (
                          <button
                            onClick={() =>
                              onOpenReportModal(
                                'MESSAGE',
                                msg.id,
                                selectedPartner.displayName,
                                msg.content
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-600 transition-opacity mb-2"
                            title="Signaler ce message"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Timestamp & Read Receipts */}
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1 px-1">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          <span>
                            {msg.read ? (
                              <span title="Lu">
                                <CheckCheck className="w-3.5 h-3.5 text-teal-600 inline" />
                              </span>
                            ) : (
                              <span title="Envoyé">
                                <Check className="w-3 h-3 text-zinc-400 inline" />
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing bubble */}
              {partnerIsTyping && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs pl-2">
                  <div className="flex items-center gap-1 bg-white border border-zinc-200 px-3 py-1.5 rounded-full shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-medium text-zinc-500 ml-1">
                      {selectedPartner.displayName} écrit...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Pending Attachments Preview Tray */}
            {pendingAttachments.length > 0 && (
              <div className="px-4 py-2.5 bg-zinc-100 border-t border-zinc-200 flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-bold text-zinc-600 mr-1">Fichiers prêts :</span>
                {pendingAttachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 bg-white border border-zinc-200 rounded-xl text-xs flex items-center gap-1.5 text-zinc-800 shadow-2xs"
                  >
                    <Paperclip className="w-3 h-3 text-teal-600" />
                    <span className="max-w-[140px] truncate font-medium">{att.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-zinc-400 hover:text-red-500 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="px-4 py-2 bg-teal-50 border-t border-teal-100 flex items-center gap-3">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <div className="flex-1">
                  <div className="w-full bg-teal-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-700">{uploadProgress}%</span>
              </div>
            )}

            {/* Quick Emoji Bar Popover */}
            {showEmojiPicker && (
              <div className="px-4 py-2 bg-white border-t border-zinc-200 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                  Réactions :
                </span>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setMessageInput((prev) => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-1 text-base hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Voice Dictation Active Banner */}
            {isListening && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span>🎙️ Dictée vocale active : Parlez distinctement dans votre micro...</span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="px-2 py-0.5 rounded-md bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold"
                >
                  Arrêter
                </button>
              </div>
            )}

            {/* Message Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3.5 border-t border-zinc-200 flex items-center gap-2 bg-white"
            >
              {/* File Attachment Button */}
              <button
                type="button"
                id="btn-chat-attach-file"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || isUploading}
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors shrink-0"
                title="Joindre un fichier (Images, Vidéos, Audio, PDF, Docs, Zip)"
              >
                <Paperclip className="w-4 h-4 text-zinc-600" />
              </button>

              {/* Emoji Picker Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors shrink-0"
                title="Insérer un emoji"
              >
                <Smile className="w-4 h-4 text-zinc-600" />
              </button>

              {/* Voice Dictation Button (Web Speech API) */}
              <button
                type="button"
                id="btn-chat-voice-dictation"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={isListening ? 'Arrêter la dictée vocale' : 'Dicter votre message à la voix (Web Speech API)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                id="input-chat-message"
                type="text"
                placeholder={isListening ? 'Écoute en cours... parlez maintenant' : `Envoyer un message à ${selectedPartner.displayName}...`}
                value={messageInput}
                onChange={handleInputChange}
                disabled={sending}
                className={`flex-1 px-4 py-2.5 bg-zinc-100 border rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:bg-white transition-all disabled:opacity-50 ${
                  isListening ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30' : 'border-transparent focus:border-zinc-300'
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                id="btn-send-chat-message"
                disabled={(!messageInput.trim() && pendingAttachments.length === 0) || sending}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Envoyer"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-400">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">
              <MessageSquare className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-800 mb-1">
              Sélectionnez un contact pour discuter
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-4">
              Échangez des messages, partagez des fichiers en toute sécurité, ou démarrez un appel audio ou vidéo en direct.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
