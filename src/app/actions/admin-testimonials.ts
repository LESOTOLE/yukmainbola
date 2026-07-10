"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteTestimonial(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete testimonial error:", error);
      return { success: false, message: "Gagal menghapus testimoni." };
    }

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, message: "Testimoni berhasil dihapus." };
  } catch (error) {
    console.error("Delete testimonial exception:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
