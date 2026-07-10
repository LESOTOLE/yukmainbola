"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addEvent(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const venue_id = formData.get("venue_id") as string;
    const event_date = formData.get("event_date") as string;
    const max_participants = parseInt(formData.get("max_participants") as string);
    const price = parseInt(formData.get("price") as string);
    
    // Default system values
    const status = "upcoming";
    const current_participants = 0;

    const { error: insertError } = await supabaseAdmin
      .from("events")
      .insert({
        title,
        description,
        venue_id,
        event_date,
        max_participants,
        current_participants,
        price,
        status
      });

    if (insertError) {
      console.error("Insert event error:", insertError);
      return { success: false, message: "Gagal menyimpan data event." };
    }

    revalidatePath("/admin/events");
    revalidatePath("/event");
    return { success: true, message: "Event berhasil ditambahkan." };

  } catch (error) {
    console.error("Add event error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

export async function updateEventStatus(id: string, newStatus: "upcoming" | "ongoing" | "completed" | "cancelled") {
  try {
    const { error } = await supabaseAdmin
      .from("events")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Update event status error:", error);
      return { success: false, message: "Gagal memperbarui status event." };
    }

    revalidatePath("/admin/events");
    revalidatePath("/event");
    return { success: true, message: "Status event diperbarui." };
  } catch (error) {
    console.error("Update event error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
