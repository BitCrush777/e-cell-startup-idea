'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CountdownTimer from '@/components/CountdownTimer';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import FileShareModal from '@/components/FileShareModal';
import RoomDetailsModal from '@/components/RoomDetailsModal';
import QrCodeModal from '@/components/QrCodeModal';
import { useToast } from '@/components/ToastProvider';
import { Room, Message, Participant } from '@/types';
import { RealtimeClient } from '@/lib/realtime';
import { getRoom, joinRoom, endRoom, sendMessage } from '@/lib/api';
import { generateTemporaryIdentity, generateParticipantId } from '@/lib/identity';
import { SafeRoomIndicator } from '@/components/SafeRoomIndicator';
import { SafeRoomWarningModal, ModerationWarningData } from '@/components/SafeRoomWarningModal';
import { RoomTerminatedState } from '@/components/RoomTerminatedState';

export default function RoomChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomCode = ((params.roomCode as string) || '').toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  // Map of participantId -> displayName for remote users currently typing
  const [typingUsers, setTypingUsers] = useState<{ [participantId: string]: string }>({});
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnreadBelow, setHasUnreadBelow] = useState<boolean>(false);
  // SafeRoom moderation state
  const [activeWarning, setActiveWarning] = useState<ModerationWarningData | null>(null);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [terminationReason, setTerminationReason] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const realtimeClientRef = useRef<RealtimeClient | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const processedWarningEventsRef = useRef<Set<string>>(new Set());
  const connectionStatusRef = useRef<string>('connecting');

  // Check if scroll is near bottom (within 100px)
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 120;
    isNearBottomRef.current = isBottom;
    if (isBottom) {
      setHasUnreadBelow(false);
    }
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    setHasUnreadBelow(false);
  };

  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom();
    } else {
      setHasUnreadBelow(true);
    }
  }, [messages, typingUsers]);

  // Main Room Lifecycle & Session Initialization
  useEffect(() => {
    if (!roomCode) return;

    let mounted = true;

    // Use sessionStorage to isolate participant session per browser tab/window
    let storedParticipant: Participant | null = null;
    const sessionKey = `templink_session_${roomCode}`;

    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        try {
          storedParticipant = JSON.parse(stored);
        } catch {}
      }
    }

    if (!storedParticipant) {
      storedParticipant = {
        participantId: generateParticipantId(),
        displayName: generateTemporaryIdentity(),
        role: 'member',
        joinedAt: Date.now(),
        isOnline: true,
      };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(sessionKey, JSON.stringify(storedParticipant));
      }
    }

    setCurrentParticipant(storedParticipant);

    async function syncRoomState() {
      try {
        const roomData = await getRoom(roomCode);
        if (!mounted) return;
        if (roomData.status === 'MODERATION_TERMINATED') {
          setIsTerminated(true);
          setTerminationReason("This temporary room was closed because the conversation repeatedly violated TempLink's conversation guidelines.");
          setIsLoading(false);
          return;
        }
        setRoom(roomData);
        setMessages(roomData.messages || []);
      } catch (err: any) {
        if (!mounted) return;
        if (err.message === 'ROOM_TERMINATED' || err.code === 'ROOM_TERMINATED') {
          setIsTerminated(true);
          setTerminationReason("This temporary room was closed because the conversation repeatedly violated TempLink's conversation guidelines.");
        }
      }
    }

    async function initSession() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch authoritative initial room state
        const roomData = await getRoom(roomCode);
        if (!mounted) return;

        if (roomData.status === 'MODERATION_TERMINATED') {
          setIsTerminated(true);
          setTerminationReason("This temporary room was closed because the conversation repeatedly violated TempLink's conversation guidelines.");
          setIsLoading(false);
          return;
        }

        if (roomData.status === 'EXPIRED' || Date.now() >= roomData.expiresAt) {
          router.push(`/room/${roomCode}/expired`);
          return;
        }

        setRoom(roomData);
        setMessages(roomData.messages || []);
        setIsLoading(false);

        // Connect Realtime WebSocket channel with participant credentials
        if (storedParticipant) {
          const client = new RealtimeClient(roomCode, storedParticipant);
          realtimeClientRef.current = client;

          client.subscribe((event: any) => {
            if (!mounted) return;

            if (event.type === 'room_state') {
              if (event.state?.status === 'MODERATION_TERMINATED') {
                setIsTerminated(true);
                setTerminationReason("This temporary room was closed because the conversation repeatedly violated TempLink's conversation guidelines.");
                client.disconnect();
                return;
              }
              if (event.state) {
                setRoom((prev) => (prev ? { ...prev, ...event.state } : event.state));
                if (event.state.messages) {
                  setMessages(event.state.messages);
                }
              }
            } else if (event.type === 'message') {
              setMessages((prev) => {
                if (prev.some((m) => m.id === event.message.id)) {
                  return prev;
                }
                return [...prev, event.message];
              });
            } else if (event.type === 'typing') {
              if (event.participantId !== storedParticipant?.participantId) {
                setTypingUsers((prev) => {
                  const copy = { ...prev };
                  if (event.typing) {
                    copy[event.participantId] = event.displayName || 'Guest';
                  } else {
                    delete copy[event.participantId];
                  }
                  return copy;
                });
              }
            } else if (event.type === 'participant_joined') {
              setRoom((prev) => {
                if (!prev) return prev;
                const exists = prev.participants.some((p) => p.participantId === event.participant.participantId);
                if (exists) return prev;
                return { ...prev, participants: [...prev.participants, event.participant] };
              });
            } else if (event.type === 'participant_left') {
              setRoom((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  participants: prev.participants.map((p) =>
                    p.participantId === event.participantId ? { ...p, isOnline: false } : p
                  ),
                };
              });
              setTypingUsers((prev) => {
                const copy = { ...prev };
                delete copy[event.participantId];
                return copy;
              });
            } else if (event.type === 'moderation_warning') {
              // Deduplicate warning events
              if (!processedWarningEventsRef.current.has(event.eventId)) {
                processedWarningEventsRef.current.add(event.eventId);
                setActiveWarning({
                  eventId: event.eventId,
                  warningNumber: event.warningNumber,
                  warningsRemaining: event.warningsRemaining,
                  maxWarnings: event.maxWarnings,
                  finalWarning: event.finalWarning,
                  message: event.message,
                });
                toast('Message blocked • Please keep the conversation respectful.', 'warning');
              }
            } else if (event.type === 'message_blocked') {
              toast(event.message || 'Message blocked by SafeRoom', 'warning');
            } else if (event.type === 'room_terminated') {
              setIsTerminated(true);
              setTerminationReason(event.message || "This temporary room was closed because the conversation repeatedly violated TempLink's conversation guidelines.");
              client.disconnect();
            } else if (event.type === 'connection_status') {
              setConnectionStatus(event.status);
              if (event.status === 'connected') {
                if (connectionStatusRef.current === 'reconnecting') {
                  toast('Connection restored', 'success', 2500, 'connection-restored');
                }
                connectionStatusRef.current = 'connected';
              } else if (event.status === 'reconnecting') {
                connectionStatusRef.current = 'reconnecting';
              }
            } else if (event.type === 'room_expiring') {
              toast(`Room expires in ${event.remainingSeconds} seconds!`, 'warning');
            } else if (event.type === 'room_expired') {
              router.push(`/room/${roomCode}/expired`);
            } else if (event.type === 'room_ended') {
              toast('The host has ended this private room.', 'warning');
              router.push(`/room/${roomCode}/expired`);
            }
          });

          client.connect();
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to initialize session');
          setIsLoading(false);
        }
      }
    }

    initSession();

    // App Resume / Foreground Synchronization
    const handleAppResume = () => {
      if (document.visibilityState === 'visible') {
        syncRoomState();
        if (realtimeClientRef.current) {
          realtimeClientRef.current.connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleAppResume);
    window.addEventListener('pageshow', handleAppResume);
    window.addEventListener('focus', handleAppResume);

    return () => {
      mounted = false;
      realtimeClientRef.current?.disconnect();
      document.removeEventListener('visibilitychange', handleAppResume);
      window.removeEventListener('pageshow', handleAppResume);
      window.removeEventListener('focus', handleAppResume);
    };
  }, [roomCode, router, toast]);

  // Keyboard-aware viewport handling & mobile immersive layout
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply chat-screen class to body to neutralize pb-16
    document.body.classList.add('chat-screen');

    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // When virtual keyboard opens, visualViewport height shrinks
      // Scroll to bottom to keep latest messages in view
      if (vv.height < window.innerHeight * 0.75) {
        setTimeout(() => scrollToBottom(false), 50);
      }
    };

    vv.addEventListener('resize', handleResize);
    return () => {
      document.body.classList.remove('chat-screen');
      vv.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    // Send typing start
    realtimeClientRef.current?.sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      realtimeClientRef.current?.sendTyping(false);
    }, 1500);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentParticipant) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    realtimeClientRef.current?.sendTyping(false);

    // Generate stable unique message ID for deduplication
    const msgId = 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

    // Optimistic / realtime dispatch
    const optimisticMsg = realtimeClientRef.current?.sendMessage(textToSend, undefined, msgId);
    if (optimisticMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === optimisticMsg.id)) return prev;
        return [...prev, optimisticMsg];
      });
      scrollToBottom();
    }

    // Backend persistent relay
    try {
      await sendMessage(
        roomCode,
        currentParticipant.participantId,
        currentParticipant.displayName,
        textToSend,
        undefined,
        msgId
      );
    } catch {}
  };

  const handleSendFile = async (fileData: any) => {
    if (!currentParticipant) return;
    const msgId = 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const content = `Shared file: ${fileData.name}`;

    const optimisticMsg = realtimeClientRef.current?.sendMessage(content, fileData, msgId);
    if (optimisticMsg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === optimisticMsg.id)) return prev;
        return [...prev, optimisticMsg];
      });
      scrollToBottom();
    }

    try {
      await sendMessage(
        roomCode,
        currentParticipant.participantId,
        currentParticipant.displayName,
        content,
        fileData,
        msgId
      );
    } catch {}
  };

  const handleExpire = () => {
    router.push(`/room/${roomCode}/expired`);
  };

  const handleEndRoom = async () => {
    try {
      await endRoom(roomCode, currentParticipant?.participantId);
      realtimeClientRef.current?.disconnect();
      toast('Private room ended.', 'info');
      router.push(`/room/${roomCode}/expired`);
    } catch {
      toast('Failed to end room', 'error');
    }
  };

  const typingNames = Object.values(typingUsers);
  const activeTypingLabel =
    typingNames.length === 1
      ? typingNames[0]
      : typingNames.length > 1
      ? `${typingNames.join(', ')}`
      : null;

  if (isTerminated) {
    return <RoomTerminatedState roomCode={roomCode} reason={terminationReason} />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen h-[100dvh] min-h-[100dvh] w-screen items-center justify-center bg-[#05070B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
            Connecting to Isolated Edge Tunnel...
          </span>
        </div>
      </div>
    );
  }

  if (error || !room || !currentParticipant) {
    return (
      <div className="flex h-screen h-[100dvh] min-h-[100dvh] w-screen items-center justify-center bg-[#05070B] p-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center flex flex-col items-center gap-4 border border-white/10 bg-[#080B12]/90 shadow-2xl">
          <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
          <h2 className="font-display font-bold text-xl text-white">Room Unavailable</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {error || 'This room does not exist or has expired.'}
          </p>
          <button
            onClick={() => router.push('/create')}
            className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mt-2"
          >
            Create New Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#05070B] text-slate-100 font-sans h-screen h-[100dvh] min-h-[100dvh] w-screen overflow-hidden flex selection:bg-primary/30">
      <Sidebar userIdentity={currentParticipant.displayName} />

      <main className="flex-1 flex flex-col md:ml-64 h-full min-h-full bg-[#05070B] relative overflow-hidden">
        {/* App Shell Header (Chat Context) — compact on mobile */}
        <header className="w-full h-12 sm:h-16 md:h-20 border-b border-white/10 glass-panel flex items-center justify-between px-2.5 sm:px-4 md:px-6 z-20 shrink-0 bg-[#080B12]/90 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <div className="flex flex-col min-w-0">
              <h2 className="font-display font-bold text-xs sm:text-base md:text-lg text-white flex items-center gap-1.5 sm:gap-2">
                <span className="font-mono truncate">{room.roomCode}</span>
                <span className="material-symbols-outlined text-primary-light text-[14px] sm:text-[18px]">
                  lock
                </span>
              </h2>
              <span
                className="text-[10px] text-slate-400 flex items-center gap-1 sm:gap-1.5 mt-0.5 font-medium"
                aria-label={`${room.participants.filter((p) => p.isOnline).length} of ${room.maxMembers || room.maxParticipants || 3} members currently connected`}
              >
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="truncate">
                  {room.participants.filter((p) => p.isOnline).length}/{room.maxMembers || room.maxParticipants || 3} •{' '}
                  {connectionStatus === 'connected'
                    ? 'Live'
                    : connectionStatus === 'reconnecting'
                    ? 'Reconnecting...'
                    : 'Offline'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {/* SafeRoom Active Protection Indicator */}
            <SafeRoomIndicator />

            {/* Authoritative Server Countdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0D111A] px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl border border-white/10 shadow-sm">
              <CountdownTimer expiresAt={room.expiresAt} onExpire={handleExpire} />
              <span className="hidden sm:inline w-px h-3.5 bg-white/20" />
              <span className="hidden sm:inline text-[10px] font-bold text-primary-light uppercase tracking-wider">
                {room.plan || 'Free'} Room
              </span>
            </div>

            {/* QR Code Modal Trigger */}
            <button
              onClick={() => setIsQrOpen(true)}
              className="p-1.5 sm:p-2 md:px-3 md:py-2 border border-white/10 hover:bg-white/5 rounded-lg sm:rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Show QR Code"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">qr_code_2</span>
              <span className="hidden md:inline">QR</span>
            </button>

            {/* Details Drawer Trigger */}
            <button
              onClick={() => setIsDetailsOpen(true)}
              className="p-1.5 sm:p-2 md:px-3 md:py-2 border border-white/10 hover:bg-white/5 rounded-lg sm:rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Room Info"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">info</span>
              <span className="hidden md:inline">Details</span>
            </button>
          </div>
        </header>

        {/* Chat Stream Section */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#05070B] via-[#080B12] to-[#05070B]">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-6 md:px-8 flex flex-col z-10 chat-scroll-mobile"
          >
            <div className="max-w-[768px] mx-auto w-full flex flex-col gap-2.5 sm:gap-3 md:gap-4 pb-20 sm:pb-28">
              {/* Ephemeral Notice */}
              <div className="flex justify-center my-1 sm:my-2">
                <div className="bg-[#0D111A]/90 border border-white/10 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 backdrop-blur-md shadow-sm">
                  <span className="material-symbols-outlined text-[13px] sm:text-[15px] text-primary-light">visibility_off</span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                    Temporary private room • SafeRoom active
                  </span>
                </div>
              </div>

              {/* Empty Chat State for First-Time Room Conversations */}
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-6 sm:py-12 px-3 sm:px-4 gap-2.5 sm:gap-3.5 my-auto animate-fade-in">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#101621] border border-white/10 flex items-center justify-center text-primary-light shadow-lg">
                    <span className="material-symbols-outlined text-[22px] sm:text-[28px]">chat_bubble_outline</span>
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Start the conversation
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                      Say hello — your conversation is limited to this temporary room.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#0D111A] border border-white/10 text-[10px] sm:text-[11px] text-slate-400">
                    <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-primary-light">fingerprint</span>
                    <span>
                      You&apos;re using temporary identity <strong className="text-white">{currentParticipant.displayName}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                /* Chat Message Stream */
                messages.map((msg) => {
                  const isMine = msg.senderId === currentParticipant.participantId;
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isMe={isMine}
                    />
                  );
                })
              )}

              {/* Typing Indicator */}
              <TypingIndicator typingNames={typingNames} />

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* New Unread Messages Indicator (when scrolled up) */}
          {hasUnreadBelow && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-30 bg-[#6366F1] text-white px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5 hover:bg-primary-hover transition-all animate-bounce"
            >
              <span>New messages</span>
              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">arrow_downward</span>
            </button>
          )}

          {/* Sticky Bottom Composer with Mobile Safe-Area */}
          <div className="absolute bottom-0 w-full p-2 sm:p-3 md:p-4 bg-[#080B12]/95 backdrop-blur-xl border-t border-white/10 z-20 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <form onSubmit={handleSendMessage} className="max-w-[768px] mx-auto flex items-end gap-1.5 sm:gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setIsFileModalOpen(true)}
                className="p-2 sm:p-2.5 md:p-3 text-slate-400 hover:text-primary-light transition-colors hover:bg-white/5 rounded-xl shrink-0"
                title="Attach file / image"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">attach_file</span>
              </button>

              <div className="flex-1 bg-[#05070B] border border-white/15 rounded-xl flex items-end focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all relative">
                <textarea
                  rows={1}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Write a private message..."
                  className="w-full bg-transparent text-white placeholder:text-slate-500 border-none focus:ring-0 resize-none py-2 sm:py-2.5 md:py-3 pl-3 sm:pl-4 pr-3 text-[13px] sm:text-sm max-h-[120px]"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 sm:p-2.5 md:p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold shadow-[0_0_15px_rgba(99,102,241,0.35)]"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                  send
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Room Details Modal */}
      <RoomDetailsModal
        room={room}
        currentParticipant={currentParticipant}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEndRoom={handleEndRoom}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        roomCode={room.roomCode}
        joinUrl={room.joinUrl}
      />

      {/* File Share Modal */}
      <FileShareModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSendFile={handleSendFile}
      />

      {/* SafeRoom Moderation Warning Modal */}
      <SafeRoomWarningModal
        warning={activeWarning}
        onDismiss={() => setActiveWarning(null)}
      />
    </div>
  );
}
