'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Room, Participant } from '@/types';
import CountdownTimer from './CountdownTimer';
import { useToast } from './ToastProvider';

interface RoomDetailsDrawerProps {
  room: Room;
  currentParticipant: Participant;
  isOpen: boolean;
  onClose: () => void;
  onEndRoom: () => void;
}

export default function RoomDetailsDrawer({
  room,
  currentParticipant,
  isOpen,
  onClose,
  onEndRoom,
}: RoomDetailsDrawerProps) {
  const { toast } = useToast();
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const actualJoinUrl =
    room.joinUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/join/${room.roomCode}`
      : `https://templink.in/join/${room.roomCode}`);

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    toast(`Room code ${room.roomCode} copied!`, 'success');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(actualJoinUrl);
    toast('Private room link copied!', 'success');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`w-80 border-l border-white/10 bg-[#010F1F] flex flex-col z-40 shrink-0 h-full fixed lg:static right-0 top-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg text-on-surface">Room Details</h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-white/5 lg:hidden"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Identity Block */}
          <div className="flex flex-col items-center text-center gap-2.5 p-4 bg-[#122131]/60 rounded-xl border border-white/5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8083ff]/30 to-[#273647] flex items-center justify-center border border-white/10 shadow-inner">
              <span className="material-symbols-outlined text-[28px] text-primary">fingerprint</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-0.5">
                Your Temporary Identity
              </p>
              <p className="text-base font-semibold text-on-surface">{currentParticipant.displayName}</p>
            </div>
          </div>

          {/* Security Info Bento */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#122131]/50 rounded-xl p-3.5 border border-white/5 flex flex-col gap-1">
              <span className="material-symbols-outlined text-primary text-[20px]">enhanced_encryption</span>
              <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">E2E Protocol</span>
              <span className="text-xs font-semibold text-on-surface">Active</span>
            </div>
            <div className="bg-[#122131]/50 rounded-xl p-3.5 border border-white/5 flex flex-col gap-1">
              <span className="material-symbols-outlined text-primary text-[20px]">history_toggle_off</span>
              <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Auto-Destruct</span>
              <span className="text-xs font-semibold text-on-surface">Enabled</span>
            </div>
          </div>

          {/* Expiration Timer Card */}
          <div className="bg-[#122131]/50 rounded-xl p-4 border border-white/5 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
              Time Remaining
            </span>
            <div className="text-xl font-bold">
              <CountdownTimer expiresAt={room.expiresAt} showIcon={false} />
            </div>
          </div>

          {/* Dynamic QR Invite */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Invite Code
            </h4>
            <div className="bg-[#122131]/60 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3.5">
              <div className="w-28 h-28 bg-white rounded-lg p-2 flex items-center justify-center shadow-md">
                <QRCodeSVG value={actualJoinUrl} size={96} />
              </div>
              <div
                onClick={copyCode}
                className="flex items-center gap-2 bg-[#051424] border border-white/10 rounded-lg px-3 py-2 w-full justify-between group cursor-pointer hover:border-primary/50 transition-colors"
              >
                <span className="font-mono-timer text-sm text-primary tracking-wider font-semibold">
                  {room.roomCode}
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">
                  content_copy
                </span>
              </div>
              <button
                onClick={copyLink}
                className="btn-ghost w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">link</span>
                Copy Invite Link
              </button>
            </div>
          </div>

          {/* Participants List */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Participants ({room.participants.length}/{room.maxMembers || room.maxParticipants || 3})
              </h4>
            </div>
            <ul className="flex flex-col gap-1.5">
              {room.participants.map((p) => (
                <li
                  key={p.participantId}
                  className="flex items-center justify-between p-2.5 bg-[#122131]/30 hover:bg-white/5 rounded-xl border border-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#273647] flex items-center justify-center text-on-surface shrink-0">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                    </div>
                    <span className="text-xs font-medium text-on-surface truncate">
                      {p.displayName} {p.participantId === currentParticipant.participantId && <span className="text-on-surface-variant">(You)</span>}
                    </span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                </li>
              ))}
            </ul>
          </div>

          {/* End Room Action */}
          <div className="pt-2 mt-auto">
            {showConfirmEnd ? (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex flex-col gap-2 animate-fade-in">
                <p className="text-xs text-red-200 text-center font-medium">
                  End room immediately? All session data will vanish.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowConfirmEnd(false)}
                    className="btn-ghost py-1.5 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onEndRoom}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded-lg text-xs transition-colors"
                  >
                    End Now
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmEnd(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
                End Private Room
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
