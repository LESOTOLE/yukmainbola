import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  // Hanya aktif di environment development untuk keamanan
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Anda harus login terlebih dahulu" }, { status: 401 });
    }

    // Ubah role pengguna yang sedang login menjadi super_admin
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: "super_admin" })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Akun ${user.email} berhasil dijadikan super_admin! Silakan refresh halaman /admin.` 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
