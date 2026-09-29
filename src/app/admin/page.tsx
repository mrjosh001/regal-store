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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [isNew, setIsNew] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function init() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      setUser({ ...user, ...profile });
      setIsAdmin(true);

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (productsData) setProducts(productsData);

      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false });
      if (usersData) setUsers(usersData);

      setLoading(false);
    }

    init();
  }, [router]);

  async function getSupabase() {
    const { createClient } = await import("@/lib/supabase/client");
    return createClient();
  }

  async function fetchProducts() {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  }

  async function fetchUsers() {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCompareAtPrice("");
    setCategory("Fashion");
    setIsNew(true);
    setImageUrl("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(String(product.price));
    setCompareAtPrice(product.compare_at_price ? String(product.compare_at_price) : "");
    setCategory(product.category || "Fashion");
    setIsNew(!!product.is_new);
    setImageUrl(product.image_url || "");
    setShowForm(true);
    setActiveTab("products");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const supabase = await getSupabase();
      const payload: Record<string, unknown> = {
        name,
        description: description || null,
        price: parseInt(price),
        category,
        is_new: isNew,
        image_url: imageUrl.trim() || null,
        compare_at_price: compareAtPrice ? parseInt(compareAtPrice) : null,
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
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setMessage(`User set to ${newRole}`);
      await fetchUsers();
    } else {
      setMessage(error.message);
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
      <div className="min-h-screen flex items-center justify-center bg-brand-surface">
        <p className="text-black/50">Loading admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-surface px-4">
        <div className="bg-white rounded-2xl border border-black/5 p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-semibold mb-2 text-brand-black">Access Denied</h1>
          <p className="text-sm text-black/50 mb-6">Only admins can access this dashboard.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-brand-blue text-white text-sm font-medium rounded-full">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface flex">
      <aside className="w-64 bg-white border-r border-black/5 hidden md:flex flex-col fixed h-full">
        <div className="p-5 border-b border-black/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-brand-black">Regal Store</p>
              <p className="text-xs text-black/40">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "products", label: "Products" },
              { id: "users", label: "Users & Admins" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-brand-blue text-white"
                  : "text-black/60 hover:bg-brand-blue/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
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
        <header className="md:hidden bg-white border-b border-black/5 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <span className="font-semibold text-brand-black">Admin</span>
          <div className="flex gap-2">
            {(["overview", "products", "users"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-3 py-1.5 rounded-full ${
                  activeTab === tab ? "bg-brand-blue text-white" : "bg-black/5"
                }`}
              >
                {tab === "users" ? "Users" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          {message && (
            <div className="mb-6 px-4 py-3 bg-brand-blue text-white text-sm rounded-xl flex items-center justify-between">
              <span>{message}</span>
              <button onClick={() => setMessage(null)} className="text-white/70">✕</button>
            </div>
          )}

          {activeTab === "overview" && (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-6 text-brand-black">Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Products", value: products.length },
                  { label: "New Items", value: products.filter((p) => p.is_new).length },
                  { label: "Total Users", value: users.length },
                  { label: "Admins", value: users.filter((u) => u.role === "admin").length },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-black/5 p-5">
                    <p className="text-sm text-black/50">{stat.label}</p>
                    <p className="text-3xl font-semibold mt-1 text-brand-black">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-black/5 p-6">
                <h2 className="font-medium mb-4 text-brand-black">Quick Actions</h2>
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
              </div>
            </div>
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
                          <option>Fashion</option>
                          <option>Electronics</option>
                          <option>Home</option>
                          <option>Accessories</option>
                          <option>Beauty</option>
                          <option>Sports</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="w-4 h-4" />
                          <span className="text-sm font-medium">Mark as New</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Image URL</label>
                      <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-brand-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
                      <p className="text-xs text-black/40 mt-1.5">Paste any image link (Imgur, etc.)</p>
                      {imageUrl && (
                        <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-black/10">
                          <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                        </div>
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
