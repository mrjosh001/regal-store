"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
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
  const [accessReason, setAccessReason] = useState<string | null>(null);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [isNew, setIsNew] = useState(true);
  const [sizeOptions, setSizeOptions] = useState("");
  const [colorOptions, setColorOptions] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"unknown" | "available" | "unavailable">("unknown");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        const currentUser = authData.user;
        if (!currentUser) {
          router.replace("/sign-in");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name, email")
          .eq("id", currentUser.id)
          .maybeSingle();
        if (profileError) throw profileError;

        if (!profile) {
          if (!cancelled) {
            setAccessReason("This sign-in does not have a matching Regal Store profile. Sign in with the account assigned the admin role, or ask the store owner to link this account.");
            setIsAdmin(false);
          }
          return;
        }

        if (profile.role !== "admin") {
          if (!cancelled) {
            setAccessReason("This account is registered, but it does not have the admin role. Sign in with the store's admin account.");
            setIsAdmin(false);
          }
          return;
        }

        if (!cancelled) {
          setUser({ ...currentUser, ...profile });
          setIsAdmin(true);
        }

        const [productsResult, usersResult] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("profiles").select("id, full_name, email, role, created_at").order("created_at", { ascending: false }),
        ]);
        if (productsResult.error) throw productsResult.error;
        if (usersResult.error) throw usersResult.error;

        if (!cancelled) {
          setProducts(productsResult.data || []);
          setUsers(usersResult.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          const details = error && typeof error === "object" && "message" in error
            ? String((error as { message?: unknown }).message || "")
            : error instanceof Error ? error.message : "";
          setLoadError(details || "The dashboard request failed without a readable error message.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => { cancelled = true; };
  }, [router]);

  async function getSupabase() {
    const { createClient } = await import("@/lib/supabase/client");
    return createClient();
  }

  async function fetchProducts() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setProducts(data || []);
  }

  async function fetchUsers() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
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
    setStockQuantity("0");
    setImageUrl("");
    setImagePreviewFailed(false);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(String(product.price));
    setCompareAtPrice(product.compare_at_price ? String(product.compare_at_price) : "");
    setCategory(["fashion", "clothing"].includes((product.category || "").toLowerCase()) ? "Clothing" : ["bag", "bags"].includes((product.category || "").toLowerCase()) ? "Bags" : product.category || "Clothing");
    setIsNew(!!product.is_new);
    setSizeOptions((product.sizes || []).join(", "));
    setColorOptions((product.colors || []).join(", "));
    setAvailabilityStatus(product.is_available === true ? "available" : product.is_available === false ? "unavailable" : "unknown");
    setStockQuantity(product.stock_quantity == null ? "" : String(product.stock_quantity));
    setImageUrl(product.image_url || "");
    setImagePreviewFailed(false);
    setShowForm(true);
    setActiveTab("products");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const normalizedImageUrl = imageUrl.trim();
      if (normalizedImageUrl) {
        const parsedImageUrl = new URL(normalizedImageUrl);
        if (parsedImageUrl.protocol !== "https:" && parsedImageUrl.protocol !== "http:") {
          throw new Error("Image links must start with https:// or http://.");
        }
      }
      const parsedPrice = Number(price);
      const parsedStockQuantity = stockQuantity.trim() === "" ? null : Number(stockQuantity);
      const parsedCompareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
      if (parsedStockQuantity !== null && (!Number.isInteger(parsedStockQuantity) || parsedStockQuantity < 0)) {
        throw new Error("Stock quantity must be a whole number of zero or more, or left blank if not tracked.");
      }
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        throw new Error("Enter a valid product price.");
      }
      if (parsedCompareAtPrice !== null && (!Number.isFinite(parsedCompareAtPrice) || parsedCompareAtPrice < parsedPrice)) {
        throw new Error("Original price must be greater than or equal to the sale price.");
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
        is_available: availabilityStatus === "available" ? true : availabilityStatus === "unavailable" ? false : null,
        stock_quantity: parsedStockQuantity,
        image_url: normalizedImageUrl || null,
        compare_at_price: parsedCompareAtPrice,
      };

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);
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

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const supabase = await getSupabase();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
      setMessage("Product deleted");
    } else {
      setMessage(error.message);
    }
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
    } else {
      setMessage(error.message || "Could not update this user's role.");
    }
  }

  async function handleSignOut() {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    router.push("/");
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f3ef]">
        <p className="text-black/50">Loading admin...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f3ef] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-brand-black">Admin dashboard could not load</h1>
          <p className="mt-3 break-words text-sm text-black/60">{loadError}</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-brand-blue px-5 py-3 text-sm font-medium text-white">Try again</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-surface px-4">
        <div className="bg-white rounded-2xl border border-black/5 p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-semibold mb-2 text-brand-black">Access Denied</h1>
          <p className="text-sm text-black/50 mb-6">{accessReason || "Only admins can access this dashboard."}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef] flex">
      <aside className="w-64 bg-[#171a21] border-r border-white/10 hidden md:flex flex-col fixed h-full text-white">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-white">Regal Store</p>
              <p className="text-xs text-white/45">STORE CONTROL</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {(
            [
              { id: "overview", label: "Overview", description: "Store performance, products, and user statistics." },
              { id: "products", label: "Products", description: "Manage clothing, bags, shoes and stock levels." },
              { id: "users", label: "Users & Admins", description: "View accounts and manage store access." },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${
                activeTab === tab.id
                  ? "bg-white/10 text-white ring-1 ring-white/10"
                  : "text-white/60 hover:bg-white/[.06] hover:text-white"
              }`}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className={`mt-1 block text-xs leading-5 ${activeTab === tab.id ? "text-white/65" : "text-white/35"}`}>{tab.description}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center text-sm font-medium">
              {(user?.full_name || user?.email || "A")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-brand-black">{user?.full_name || "Admin"}</p>
              <p className="text-xs text-black/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full text-sm py-2 border border-black/10 rounded-xl hover:bg-black/5">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 md:hidden">
          <div>
            <p className="text-xs text-black/45">Regal Store</p>
            <p className="font-semibold text-brand-black">Admin dashboard</p>
          </div>
          <button
            type="button"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-navigation"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="flex min-h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-brand-black shadow-sm"
          >
            {activeTab === "users" ? "Users & Admins" : activeTab === "products" ? "Products" : "Overview"}
            <span aria-hidden="true" className={mobileNavOpen ? "rotate-180 transition-transform" : "transition-transform"}>⌄</span>
          </button>
          {mobileNavOpen && (
            <nav id="admin-mobile-navigation" aria-label="Admin sections" className="absolute left-0 right-0 top-full border-b border-black/10 bg-white px-4 py-3 shadow-xl">
              <div className="mx-auto flex max-w-3xl flex-col gap-2">
                {([
                  { id: "overview", label: "Overview", description: "Store performance, products, and user statistics." },
                  { id: "products", label: "Products", description: "Add, edit, and manage clothing and occasional footwear." },
                  { id: "users", label: "Users & Admins", description: "View accounts and manage store access." },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false); }}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      activeTab === tab.id ? "border-brand-blue bg-brand-blue/5" : "border-black/5 hover:bg-black/[.02]"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-brand-black">{tab.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-black/50">{tab.description}</span>
                  </button>
                ))}
              </div>
            </nav>
          )}
        </header>

        <main className="w-full max-w-[1600px] p-4 sm:p-6 lg:p-10 md:ml-64">
          {message && (
            <div className="mb-6 px-4 py-3 bg-brand-blue text-white text-sm rounded-xl flex items-center justify-between">
              <span>{message}</span>
              <button onClick={() => setMessage(null)} className="text-white/70">✕</button>
            </div>
          )}

          {activeTab === "overview" && (
            <div>
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#7b705f]">REGAL STORE / CONTROL ROOM</p><h1 className="text-3xl font-semibold tracking-[-.04em] text-[#202127] sm:text-4xl">Store overview</h1><p className="mt-2 text-sm text-black/50">Inventory, catalogue and customer access at a glance.</p></div><button onClick={() => { resetForm(); setShowForm(true); setActiveTab("products"); }} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#202127] px-5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#343741]">+ Add a product</button></div>
              <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 xl:gap-4">
                {[
                  { label: "Total Products", value: products.length },
                  { label: "New Items", value: products.filter((p) => p.is_new).length },
                  { label: "Total Users", value: users.length },
                  { label: "Admins", value: users.filter((u) => u.role === "admin").length },
                  { label: "Low stock (1–5)", value: products.filter((p) => p.stock_quantity != null && p.stock_quantity > 0 && p.stock_quantity <= 5).length },
                  { label: "Out of stock", value: products.filter((p) => p.stock_quantity === 0 || p.is_available === false).length },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-black/[.05] bg-white p-5 shadow-[0_8px_28px_-20px_rgba(0,0,0,.22)] transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-xs font-medium text-black/45">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#202127]">{stat.value}</p>
                    <div className="mt-4 h-1 w-10 rounded-full bg-[#c7b79a]" />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"><div className="rounded-3xl border border-black/[.05] bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8b7b62]">Shortcuts</p><h2 className="mb-5 mt-2 text-xl font-semibold tracking-tight text-[#202127]">Quick actions</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                      setActiveTab("products");
                    }}
                    className="px-5 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-full"
                  >
                    + Add Product
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="px-5 py-2.5 border border-black/10 text-sm font-medium rounded-full hover:bg-black/5"
                  >
                    Manage Users
                  </button>
                  <Link href="/" className="px-5 py-2.5 border border-black/10 text-sm font-medium rounded-full hover:bg-black/5">
                    View Store
                  </Link>
                </div>
              </div><div className="rounded-3xl bg-[#202127] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">Inventory pulse</p><h2 className="mt-2 text-xl font-semibold">Stock at a glance</h2><p className="mt-3 text-sm leading-6 text-white/60">Keep quantities accurate. Customers see availability on product cards and product pages, and the cart checks stock again before an order opens in WhatsApp.</p><div className="mt-6 space-y-3 text-sm"><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-white/60">Stock not tracked</span><strong>{products.filter((p) => p.stock_quantity == null).length}</strong></div><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-white/60">Available stock units</span><strong>{products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0).toLocaleString()}</strong></div><div className="flex items-center justify-between"><span className="text-white/60">Categories in catalogue</span><strong>{new Set(products.map((p) => ["bag", "bags"].includes((p.category || "").toLowerCase()) ? "Bags" : ["fashion", "clothing"].includes((p.category || "").toLowerCase()) ? "Clothing" : p.category).filter(Boolean)).size}</strong></div></div></div></div>
          )}

          {activeTab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-brand-black">Products</h1>
                  <p className="text-sm text-black/50 mt-1">{products.length} products</p>
                </div>
                <button
                  onClick={() => {
                    if (showForm) resetForm();
                    else {
                      resetForm();
                      setShowForm(true);
                    }
                  }}
                  className="px-5 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-full"
                >
                  {showForm ? "Cancel" : "+ Add Product"}
                </button>
              </div>

              {showForm && (
                <div className="bg-white rounded-2xl border border-black/5 p-6 mb-8">
                  <h2 className="text-lg font-medium mb-5 text-brand-black">
                    {editingId ? "Edit Product" : "Add New Product"}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Name *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                          className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Sale Price (₦) *</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0"
                          className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-brand-blue/15 bg-brand-blue/[.03] p-4">
                      <label htmlFor="product-stock" className="block text-sm font-medium mb-1.5">Stock quantity</label>
                      <input id="product-stock" type="number" inputMode="numeric" min="0" step="1" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="e.g. 12"
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                      <p className="mt-1.5 text-xs leading-5 text-black/50">Enter the number physically in stock. Set 0 to show Sold out. Leave blank only if this product is not being stock-counted yet. Stock is not reserved until an order is confirmed.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Original Price (₦)</label>
                      <input type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} min="0"
                        placeholder="Leave empty if not on sale"
                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                      <p className="text-xs text-black/40 mt-1">If higher than sale price, shows “-% OFF” badge on the store</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm">
                          <option>Clothing</option>
                          <option>Bags</option>
                          <option>Shoes</option>
                        </select>
                      </div>
                      <div className="flex flex-wrap items-end gap-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="w-4 h-4" />
                          <span className="text-sm font-medium">Mark as New</span>
                        </label>
                        <div className="min-w-0 flex-1">
                          <label htmlFor="product-availability" className="mb-1.5 block text-sm font-medium">Availability</label>
                          <select id="product-availability" value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as "unknown" | "available" | "unavailable")}
                            className="w-full rounded-xl border border-black/10 bg-brand-surface px-3 py-3 text-sm">
                            <option value="unknown">Confirm with store</option>
                            <option value="available">Available to order</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Sizes (optional)</label>
                        <input type="text" value={sizeOptions} onChange={(e) => setSizeOptions(e.target.value)}
                          placeholder="S, M, L, XL or 40, 41, 42"
                          className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                        <p className="mt-1 text-xs text-black/40">Separate options with commas. Leave empty if the item has no size choices.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Colours (optional)</label>
                        <input type="text" value={colorOptions} onChange={(e) => setColorOptions(e.target.value)}
                          placeholder="Black, White, Navy"
                          className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                        <p className="mt-1 text-xs text-black/40">Separate options with commas. Only list colours actually available.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Image URL</label>
                      <input type="url" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreviewFailed(false); }}
                        placeholder="https://example.com/product-photo.jpg"
                        inputMode="url"
                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                      <p className="text-xs text-black/50 mt-1.5">Host the photo on an external image service, then paste its direct public image URL here. Regal Store saves only the link—no image files are stored in Supabase, helping keep database egress down. Use a link that opens the image itself, not a webpage around it.</p>
                      {imageUrl.trim() && !imagePreviewFailed && (
                        <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-xl border border-black/10 bg-brand-surface">
                          <img src={imageUrl.trim()} alt={name ? `${name} image preview` : "Product image preview"} className="h-full w-full object-cover" onError={() => setImagePreviewFailed(true)} />
                        </div>
                      )}
                      {imageUrl.trim() && imagePreviewFailed && (
                        <p role="status" className="mt-2 text-sm text-red-600">This image link could not be loaded. Check that it is a direct public image URL.</p>
                      )}
                    </div>

                    <button type="submit" disabled={submitting}
                      className="px-8 py-3 bg-brand-blue text-white text-sm font-medium rounded-full disabled:opacity-50 hover:bg-brand-blue-dark">
                      {submitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                {products.length === 0 ? (
                  <div className="p-12 text-center text-black/40">No products yet</div>
                ) : (
                  <div className="divide-y divide-black/5">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-black/30">—</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-brand-black">{product.name}</p>
                          <p className="text-xs text-black/40">
                            {product.category} · {formatPrice(product.price)}
                            {product.is_new && <span className="ml-2 text-brand-blue font-medium">New</span>}
                            <span className={`ml-2 font-medium ${product.stock_quantity === 0 || product.is_available === false ? "text-red-600" : product.stock_quantity != null && product.stock_quantity <= 5 ? "text-amber-700" : "text-emerald-700"}`}>{product.stock_quantity === 0 ? "Sold out" : product.is_available === false ? "Unavailable" : product.stock_quantity == null ? "Stock not tracked" : `${product.stock_quantity} in stock`}</span>
                          </p>
                        </div>
                        <button onClick={() => startEdit(product)}
                          className="text-sm text-brand-blue hover:bg-brand-blue/5 px-3 py-1.5 rounded-lg">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product.id)}
                          className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-brand-black">Users & Admins</h1>
                <p className="text-sm text-black/50 mt-1">Manage customers and promote users to admin</p>
              </div>
              <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                {users.length === 0 ? (
                  <div className="p-12 text-center text-black/40">No users yet</div>
                ) : (
                  <div className="divide-y divide-black/5">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center gap-4 p-4">
                        <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {(u.full_name || u.email || "U")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-brand-black">{u.full_name || "No name"}</p>
                          <p className="text-xs text-black/40 truncate">{u.email}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.role === "admin" ? "bg-brand-blue text-white" : "bg-black/5 text-black/60"
                        }`}>
                          {u.role || "customer"}
                        </span>
                        {u.id !== user?.id && (
                          <button onClick={() => toggleAdmin(u.id, u.role)}
                            className="text-sm px-3 py-1.5 border border-black/10 rounded-lg hover:bg-black/5">
                            {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
