"use client";

import { useRealtimeSlots } from "@/hooks/useRealtimeSlots";

interface LiveSlotInfoProps {
  scheduleId: string;
  initialPlayers: number;
  maxPlayers: number;
  variant: 'fraction' | 'slots-left' | 'status-text';
}

export default function LiveSlotInfo({ scheduleId, initialPlayers, maxPlayers, variant }: LiveSlotInfoProps) {
  const currentPlayers = useRealtimeSlots('schedules', scheduleId, initialPlayers);
  
  if (variant === 'slots-left') {
    return (
      <>{maxPlayers - currentPlayers} <span className="text-text-muted text-sm font-normal">/ {maxPlayers}</span></>
    );
  }
  
  if (variant === 'status-text') {
    return currentPlayers >= maxPlayers ? 'Penuh' : 'Tersedia';
  }
  
  return (
    <>{currentPlayers} / {maxPlayers}</>
  );
}
