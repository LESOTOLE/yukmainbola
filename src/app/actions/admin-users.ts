"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: "super_admin" | "admin" | "member" | "guest") {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Update role error:", error);
      return { success: false, message: "Gagal memperbarui role pengguna." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "Role berhasil diperbarui." };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
