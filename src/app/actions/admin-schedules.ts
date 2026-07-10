"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addSchedule(formData: FormData) {
  try {
    const venue_id = formData.get("venue_id") as string;
    const date = formData.get("date") as string;
    const start_time = formData.get("start_time") as string;
    const end_time = formData.get("end_time") as string;
    const max_players = parseInt(formData.get("max_players") as string);
    const price_per_person = parseInt(formData.get("price_per_person") as string);
    
    // Default system values
    const status = "open";
    const current_players = 0;

    const { error: insertError } = await supabaseAdmin
      .from("schedules")
      .insert({
        venue_id,
        date,
        start_time,
        end_time,
        max_players,
        current_players,
        price_per_person,
        status
      });

    if (insertError) {
      console.error("Insert schedule error:", insertError);
      return { success: false, message: "Gagal menyimpan jadwal mabar." };
    }

    revalidatePath("/admin/schedules");
    revalidatePath("/jadwal");
    return { success: true, message: "Jadwal mabar berhasil ditambahkan." };

  } catch (error) {
    console.error("Add schedule error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

export async function updateScheduleStatus(id: string, newStatus: "open" | "full" | "completed" | "cancelled") {
  try {
    const { error } = await supabaseAdmin
      .from("schedules")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Update schedule status error:", error);
      return { success: false, message: "Gagal memperbarui status jadwal." };
    }

    revalidatePath("/admin/schedules");
    revalidatePath("/jadwal");
    return { success: true, message: "Status jadwal diperbarui." };
  } catch (error) {
    console.error("Update schedule error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
