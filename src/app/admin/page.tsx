"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  image_urls?: string[] | null;
  category: string | null;
  is_new: boolean | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  is_available?: boolean | null;
  stock_quantity?: number | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
  banned_at?: string | null;
  deleted_at?: string | null;
};

type Tab = "overview" | "products" | "users";

function parseOptions(value: string): string[] {
  const unique = new Map<string, string>();
  for (const option of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    const key = option.toLocaleLowerCase();
    if (!unique.has(key)) unique.set(key, option);
  }
  return [...unique.values()];
}

function parseImageUrls(text: string): string[] {
  return [...new Set(text.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean))];
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [isNew, setIsNew] = useState(true);
  const [sizeOptions, setSizeOptions] = useState("");
  const [colorOptions, setColorOptions] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"unknown" | "available" | "unavailable">("unknown");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!authData.user) {
          router.replace("/admin/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name, email, banned_at, deleted_at")
          .eq("id", authData.user.id)
          .maybeSingle();
        if (profileError) throw profileError;

        if (!profile || profile.role !== "admin" || profile.banned_at || profile.deleted_at) {
          await supabase.auth.signOut();
          router.replace("/admin/login?error=forbidden");
          return;
        }

        if (!cancelled) {
          setUser({ ...authData.user, ...profile });
          setIsAdmin(true);
        }

        const [productsResult, usersResult] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase
            .from("profiles")
            .select("id, full_name, email, role, created_at, banned_at, deleted_at")
            .order("created_at", { ascending: false }),
        ]);
        if (productsResult.error) throw productsResult.error;
        if (usersResult.error) throw usersResult.error;
        if (!cancelled) {
          setProducts(productsResult.data || []);
          setUsers(usersResult.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Failed to load admin.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function getSupabase() {
    const { createClient } = await import("@/lib/supabase/client");
    return createClient();
  }

  async function fetchProducts() {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    setProducts(data || []);
  }

  async function fetchUsers() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, banned_at, deleted_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setUsers(data || []);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCompareAtPrice("");
    setCategory("Clothing");
    setIsNew(true);
    setSizeOptions("");
    setColorOptions("");
    setAvailabilityStatus("unknown");
    setStockQuantity("");
    setImageUrlsText("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(String(product.price));
    setCompareAtPrice(product.compare_at_price ? String(product.compare_at_price) : "");
    setCategory(
      ["fashion", "clothing"].includes((product.category || "").toLowerCase())
        ? "Clothing"
        : ["bag", "bags"].includes((product.category || "").toLowerCase())
          ? "Bags"
          : product.category || "Clothing"
    );
    setIsNew(!!product.is_new);
    setSizeOptions((product.sizes || []).join(", "));
    setColorOptions((product.colors || []).join(", "));
    setAvailabilityStatus(
      product.is_available === true ? "available" : product.is_available === false ? "unavailable" : "unknown"
    );
    setStockQuantity(product.stock_quantity == null ? "" : String(product.stock_quantity));
    const gallery =
      product.image_urls && product.image_urls.length
        ? product.image_urls
        : product.image_url
          ? [product.image_url]
          : [];
    setImageUrlsText(gallery.join("\n"));
    setShowForm(true);
    setActiveTab("products");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const galleryUrls = parseImageUrls(imageUrlsText);
      for (const url of galleryUrls) {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          throw new Error("Each image link must start with https:// or http://.");
        }
      }
      const parsedPrice = Number(price);
      const parsedStock = stockQuantity.trim() === "" ? null : Number(stockQuantity);
      const parsedCompare = compareAtPrice ? Number(compareAtPrice) : null;
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) throw new Error("Enter a valid price.");
      if (parsedStock !== null && (!Number.isInteger(parsedStock) || parsedStock < 0)) {
        throw new Error("Stock must be a whole number ≥ 0, or blank.");
      }

      const supabase = await getSupabase();
      const payload: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        category,
        is_new: isNew,
        sizes: parseOptions(sizeOptions),
        colors: parseOptions(colorOptions),
        is_available:
          availabilityStatus === "available" ? true : availabilityStatus === "unavailable" ? false : null,
        stock_quantity: parsedStock,
        image_url: galleryUrls[0] || null,
        image_urls: galleryUrls,
        compare_at_price: parsedCompare,
      };

      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
        setMessage("Product updated!");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        setMessage("Product added!");
      }
      resetForm();
      await fetchProducts();
    } catch (err: any) {
      setMessage(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    const supabase = await getSupabase();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
      setMessage("Product deleted");
    } else setMessage(error.message);
  }

  async function toggleAdmin(userId: string, currentRole: string | null) {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    if (!confirm(`Set this user as ${newRole}?`)) return;
    const supabase = await getSupabase();
    const { error } = await supabase.rpc("admin_set_profile_role", {
      target_user_id: userId,
      new_role: newRole,
    });
    if (!error) {
      setMessage(`User set to ${newRole}`);
      await fetchUsers();
    } else setMessage(error.message || "Could not update role.");
  }

  async function banUser(userId: string, currentlyBanned: boolean) {
    if (!confirm(currentlyBanned ? "Unban this user?" : "Ban this user?")) return;
    const supabase = await getSupabase();
    const { error } = await supabase.rpc("admin_set_user_banned", {
      target_user_id: userId,
      should_ban: !currentlyBanned,
    });
    if (!error) {
      setMessage(currentlyBanned ? "User unbanned" : "User banned");
      await fetchUsers();
    } else setMessage(error.message || "Could not update ban status. Run the SQL migration if this fails.");
  }

  async function deleteUser(userId: string) {
    if (!confirm("Soft-delete this user? They will lose store access.")) return;
    const supabase = await getSupabase();
    const { error } = await supabase.rpc("admin_soft_delete_user", { target_user_id: userId });
    if (!error) {
      setMessage("User deleted");
      await fetchUsers();
    } else setMessage(error.message || "Could not delete user. Run the SQL migration if this fails.");
  }

  async function handleSignOut() {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function formatPrice(p: number) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(p);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f3ef]">
        <p className="text-black/50">Loading admin…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f3ef] px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Admin could not load</h1>
          <p className="mt-3 text-sm text-black/60">{loadError}</p>
          <Link href="/admin/login" className="mt-6 inline-block rounded-full bg-[#1769e0] px-5 py-3 text-sm text-white">
            Admin login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-[#f4f3ef]">
      <aside className="fixed hidden h-full w-64 flex-col border-r border-white/10 bg-[#171a21] text-white md:flex">
        <div className="border-b border-white/10 p-5">
          <p className="font-semibold">Regal Store</p>
          <p className="text-xs text-white/45">STORE CONTROL</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {(["overview", "products", "users"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold capitalize ${
                activeTab === tab ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[.06]"
              }`}
            >
              {tab === "users" ? "Users & Admins" : tab}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm">{user?.full_name || "Admin"}</p>
          <p className="truncate text-xs text-white/40">{user?.email}</p>
          <button onClick={handleSignOut} className="mt-3 w-full rounded-xl border border-white/15 py-2 text-sm">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 md:hidden">
          <p className="font-semibold">Admin</p>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="overview">Overview</option>
            <option value="products">Products</option>
            <option value="users">Users</option>
          </select>
        </header>

        <main className="p-4 sm:p-6 lg:p-10">
          {message && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-[#1769e0] px-4 py-3 text-sm text-white">
              <span>{message}</span>
              <button onClick={() => setMessage(null)}>✕</button>
            </div>
          )}

          {activeTab === "overview" && (
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Store overview</h1>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                  <p className="text-xs text-black/45">Products</p>
                  <p className="mt-1 text-3xl font-semibold">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                  <p className="text-xs text-black/45">Users</p>
                  <p className="mt-1 text-3xl font-semibold">{users.length}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-5">
                  <p className="text-xs text-black/45">Admins</p>
                  <p className="mt-1 text-3xl font-semibold">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                    setActiveTab("products");
                  }}
                  className="rounded-full bg-[#1769e0] px-5 py-3 text-sm font-semibold text-white"
                >
                  Add product
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold"
                >
                  Manage users
                </button>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold">Products</h1>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="rounded-full bg-[#1769e0] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  {showForm ? "New product" : "Add product"}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-2xl border border-black/5 bg-white p-6">
                  <h2 className="font-semibold">{editingId ? "Edit product" : "Add product"}</h2>
                  <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm" />
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (NGN)" className="rounded-xl border border-black/10 px-4 py-3 text-sm" />
                    <input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="Compare-at price" className="rounded-xl border border-black/10 px-4 py-3 text-sm" />
                  </div>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm">
                    <option>Clothing</option>
                    <option>Bags</option>
                    <option>Shoes</option>
                  </select>
                  <input value={sizeOptions} onChange={(e) => setSizeOptions(e.target.value)} placeholder="Sizes (comma separated, e.g. 30-38 or 40, 42)" className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm" />
                  <input value={colorOptions} onChange={(e) => setColorOptions(e.target.value)} placeholder="Colours (comma separated)" className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as any)} className="rounded-xl border border-black/10 px-4 py-3 text-sm">
                      <option value="unknown">Availability unknown</option>
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                    <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="Stock quantity" className="rounded-xl border border-black/10 px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Image URLs (one per line)</label>
                    <textarea
                      value={imageUrlsText}
                      onChange={(e) => setImageUrlsText(e.target.value)}
                      rows={4}
                      placeholder={"https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg"}
                      className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm"
                    />
                    <p className="mt-1 text-xs text-black/45">Add as many image links as you want. First URL is the main photo.</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                    Mark as new
                  </label>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="rounded-full bg-[#1769e0] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
                      {submitting ? "Saving…" : editingId ? "Update" : "Add product"}
                    </button>
                    <button type="button" onClick={resetForm} className="rounded-full border border-black/10 px-6 py-3 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {products.map((p) => {
                  const imgs = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
                  return (
                    <div key={p.id} className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/5">
                        {imgs[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-black/50">
                          {formatPrice(p.price)} · {p.category}
                          {imgs.length > 1 ? ` · ${imgs.length} photos` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h1 className="text-2xl font-semibold">Users & Admins</h1>
              <p className="mt-1 text-sm text-black/50">Registration dates, ban, delete, and admin roles</p>
              <div className="mt-6 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white">
                {users.length === 0 ? (
                  <p className="p-8 text-center text-black/40">No users yet</p>
                ) : (
                  users.map((u) => {
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
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{u.full_name || "No name"}</p>
                          <p className="text-xs text-black/40">{u.email || "—"}</p>
                          <p className="mt-1 text-[11px] text-black/45">Registered {registered}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            u.role === "admin" ? "bg-[#1769e0] text-white" : "bg-black/5 text-black/60"
                          }`}>{u.role || "customer"}</span>
                          {isBanned && !isDeleted && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">Banned</span>
                          )}
                          {isDeleted && (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Deleted</span>
                          )}
                          {u.id !== user?.id && !isDeleted && (
                            <>
                              <button onClick={() => toggleAdmin(u.id, u.role)} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm">
                                {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                              </button>
                              <button onClick={() => banUser(u.id, isBanned)} className="rounded-lg border border-amber-200 px-3 py-1.5 text-sm text-amber-800">
                                {isBanned ? "Unban" : "Ban"}
                              </button>
                              <button onClick={() => deleteUser(u.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600">
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
