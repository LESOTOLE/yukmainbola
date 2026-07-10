"use client";

import { useState } from "react";
import { updateUserRole } from "@/app/actions/admin-users";
import { Loader2 } from "lucide-react";

interface RoleSelectProps {
  userId: string;
  currentRole: "super_admin" | "admin" | "member" | "guest";
  disabled?: boolean;
}

export default function RoleSelect({ userId, currentRole, disabled = false }: RoleSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as any;
    if (newRole === currentRole) return;

    if (!confirm(`Yakin ingin mengubah role menjadi ${newRole}?`)) {
      e.target.value = currentRole; // Reset
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) {
        alert(result.message);
        e.target.value = currentRole; // Reset
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
      e.target.value = currentRole; // Reset
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select 
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={disabled || isUpdating}
        className="bg-background border border-border text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-text disabled:opacity-50"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
      {isUpdating && <Loader2 size={16} className="animate-spin text-primary shrink-0" />}
    </div>
  );
}
