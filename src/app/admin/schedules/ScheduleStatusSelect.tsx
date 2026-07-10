"use client";

import { useState } from "react";
import { updateScheduleStatus } from "@/app/actions/admin-schedules";
import { Loader2 } from "lucide-react";

interface ScheduleStatusSelectProps {
  id: string;
  currentStatus: "open" | "full" | "completed" | "cancelled";
}

export default function ScheduleStatusSelect({ id, currentStatus }: ScheduleStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as any;
    if (newStatus === currentStatus) return;

    if (!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) {
      e.target.value = currentStatus; // Reset
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateScheduleStatus(id, newStatus);
      if (!result.success) {
        alert(result.message);
        e.target.value = currentStatus; // Reset
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
      e.target.value = currentStatus; // Reset
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select 
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={isUpdating}
        className="bg-background border border-border text-xs rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-text disabled:opacity-50"
      >
        <option value="open">Open</option>
        <option value="full">Full</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      {isUpdating && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}
    </div>
  );
}
