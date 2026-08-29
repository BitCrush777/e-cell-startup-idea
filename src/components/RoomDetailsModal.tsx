'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Room, Participant } from '@/types';
import CountdownTimer from './CountdownTimer';
import { useToast } from './ToastProvider';

interface RoomDetailsModalProps {
  room: Room;
  currentParticipant: Participant;
  isOpen: boolean;
  onClose: () => void;
  onEndRoom: () => void;
}

export default function RoomDetailsModal({
  room,
  currentParticipant,
  isOpen,
  onClose,
  onEndRoom,
}: RoomDetailsModalProps) {
  const { toast } = useToast();
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-white/15 bg-[#0D1C2D]/95 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="font-display font-bold text-lg text-on-surface">Room Details</h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Identity Block */}
        <div className="flex items-center gap-3 p-3.5 bg-[#122131]/60 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-full bg-[#1c2b3c] flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[22px]">fingerprint</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Your Ephemeral Identity
            </p>
            <p className="text-sm font-semibold text-on-surface">{currentParticipant.displayName}</p>
          </div>
        </div>

        {/* Server Expiration Status */}
        <div className="bg-[#122131]/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Time Remaining
            </span>
          </div>
          <CountdownTimer expiresAt={room.expiresAt} showIcon={false} />
        </div>

        {/* Dynamic QR Invite Block */}
        <div className="bg-[#122131]/60 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
          <div className="bg-white p-2.5 rounded-lg shadow-sm">
            <QRCodeSVG value={actualJoinUrl} size={120} />
          </div>
          <div
            onClick={copyCode}
            className="flex items-center justify-between w-full bg-[#051424] border border-white/10 rounded-lg px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <span className="font-mono-timer text-sm text-primary tracking-widest font-bold">
              {room.roomCode}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              content_copy
            </span>
          </div>
          <button
            onClick={copyLink}
            className="btn-ghost w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            Copy Invite Link
          </button>
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Participants ({room.participants.length}/{room.maxMembers || room.maxParticipants || 3})
          </h4>
          <ul className="space-y-1.5">
            {room.participants.map((p) => (
              <li
                key={p.participantId}
                className="flex items-center justify-between p-2.5 bg-[#122131]/40 rounded-xl border border-white/5 text-xs"
              >
                <span className="font-medium text-on-surface">
                  {p.displayName} {p.participantId === currentParticipant.participantId && '(You)'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    p.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* End Room Action */}
        <div className="pt-2">
          {showConfirmEnd ? (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex flex-col gap-2 animate-fade-in">
              <p className="text-xs text-red-200 text-center font-medium">
                End room immediately? All session communication will end.
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
              className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
              End Private Room
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
