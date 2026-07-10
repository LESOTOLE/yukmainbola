"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTestimonial(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Anda harus login terlebih dahulu." };
    }

    const rating = parseInt(formData.get("rating") as string);
    const content = formData.get("content") as string;

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, message: "Rating harus antara 1-5 bintang." };
    }

    if (!content || content.trim().length < 10) {
      return { success: false, message: "Ulasan terlalu pendek (minimal 10 karakter)." };
    }

    const { error } = await supabase
      .from("testimonials")
      .insert({
        user_id: user.id,
        rating,
        content: content.trim()
      });

    if (error) {
      console.error("Insert testimonial error:", error);
      return { success: false, message: "Gagal menyimpan ulasan Anda." };
    }

    revalidatePath("/profil");
    revalidatePath("/");
    return { success: true, message: "Ulasan berhasil dikirim! Terima kasih." };

  } catch (error) {
    console.error("Add testimonial error:", error);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
