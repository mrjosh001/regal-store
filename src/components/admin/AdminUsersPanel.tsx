"use client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
  banned_at?: string | null;
  deleted_at?: string | null;
};

type Props = {
  users: Profile[];
  currentUserId?: string;
  onToggleAdmin: (userId: string, role: string | null) => void;
  onBan: (userId: string, isBanned: boolean) => void;
  onDelete: (userId: string) => void;
};

export default function AdminUsersPanel({ users, currentUserId, onToggleAdmin, onBan, onDelete }: Props) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-black">Users &amp; Admins</h1>
        <p className="mt-1 text-sm text-black/50">
          Registration dates, ban or delete accounts, and manage admin access
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {users.length === 0 ? (
          <div className="p-12 text-center text-black/40">No users yet</div>
        ) : (
          <div className="divide-y divide-black/5">
            {users.map((u) => {
              const isBanned = Boolean(u.banned_at);
              const isDeleted = Boolean(u.deleted_at);
              const registered = u.created_at
                ? new Date(u.created_at).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Unknown";
              return (
                <div key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-sm font-medium text-brand-blue">
                    {(u.full_name || u.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-black">{u.full_name || "No name"}</p>
                    <p className="truncate text-xs text-black/40">{u.email || "—"}</p>
                    <p className="mt-1 text-[11px] text-black/45">Registered {registered}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.role === "admin" ? "bg-brand-blue text-white" : "bg-black/5 text-black/60"
                      }`}
                    >
                      {u.role || "customer"}
                    </span>
                    {isBanned && !isDeleted && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">Banned</span>
                    )}
                    {isDeleted && (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Deleted</span>
                    )}
                    {u.id !== currentUserId && !isDeleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => onToggleAdmin(u.id, u.role)}
                          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
                        >
                          {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onBan(u.id, isBanned)}
                          className="rounded-lg border border-amber-200 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-50"
                        >
                          {isBanned ? "Unban" : "Ban"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(u.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
