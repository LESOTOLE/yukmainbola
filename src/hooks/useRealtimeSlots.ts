import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeSlots(table: 'schedules' | 'events', recordId: string, initialCount: number) {
  const [currentCount, setCurrentCount] = useState(initialCount);

  useEffect(() => {
    setCurrentCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const supabase = createClient();

    // Generate a unique channel name to avoid Strict Mode collisions
    // where .on() is called after the channel from the previous render is already subscribed
    const channelName = `realtime_${table}_${recordId}_${Math.random().toString(36).substring(7)}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: `id=eq.${recordId}`,
        },
        (payload) => {
          if (table === 'schedules') {
            const newPlayers = payload.new.current_players;
            if (typeof newPlayers === 'number') {
              setCurrentCount(newPlayers);
            }
          } else if (table === 'events') {
            const newParticipants = payload.new.current_participants;
            if (typeof newParticipants === 'number') {
              setCurrentCount(newParticipants);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, recordId]);

  return currentCount;
}
