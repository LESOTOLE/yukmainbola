import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import RoleSelect from "./RoleSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = {
  title: "Kelola Pengguna | Admin Panel",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Get current user to prevent changing own role
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Kelola Pengguna</h1>
        <p className="text-text-muted mt-2">Daftar seluruh member, admin, dan pengaturan hak akses.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-background/50 border-b border-border text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Pengguna</th>
                <th className="px-6 py-4 font-semibold">Kontak</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles?.map((profile) => {
                const initials = profile.full_name?.substring(0, 2).toUpperCase() || "U";
                const isSelf = profile.id === user?.id;

                return (
                  <tr key={profile.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-text">{profile.full_name}</p>
                          {isSelf && <span className="text-xs text-primary font-medium">Anda</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p>{profile.phone || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <RoleSelect 
                        userId={profile.id} 
                        currentRole={profile.role} 
                        disabled={isSelf} 
                      />
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {formatDate(profile.created_at)}
                    </td>
                  </tr>
                );
              })}
              
              {!profiles || profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
