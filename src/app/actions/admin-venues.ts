"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addVenue(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const maps_url = formData.get("maps_url") as string;
    const image = formData.get("image") as File;

    let image_url = null;

    if (image && image.size > 0) {
      // Create a unique filename
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `venues/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("venues")
        .upload(filePath, image);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, message: "Gagal mengunggah gambar lapangan." };
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from("venues")
        .getPublicUrl(filePath);
        
      image_url = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabaseAdmin
      .from("venues")
      .insert({
        name,
        address,
        maps_url: maps_url || null,
        image_url
      });

    if (insertError) {
      console.error("Insert venue error:", insertError);
      return { success: false, message: "Gagal menyimpan data lapangan." };
    }

    revalidatePath("/admin/venues");
    return { success: true, message: "Lapangan berhasil ditambahkan." };

  } catch (error) {
    console.error("Add venue error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

export async function deleteVenue(id: string) {
  try {
    // Note: If venue is referenced in schedules/events, deletion might fail due to foreign key constraints.
    const { error } = await supabaseAdmin
      .from("venues")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === '23503') {
        return { success: false, message: "Gagal menghapus: Lapangan ini sedang digunakan di jadwal mabar/event." };
      }
      return { success: false, message: "Gagal menghapus lapangan." };
    }

    revalidatePath("/admin/venues");
    return { success: true, message: "Lapangan berhasil dihapus." };
  } catch (error) {
    console.error("Delete venue error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
