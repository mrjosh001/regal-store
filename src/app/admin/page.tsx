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
  image_url: string | null;
  category: string | null;
  is_new: boolean | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [isNew, setIsNew] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // Dynamically import to avoid build-time env issues
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setProducts(data);
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
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const supabase = await getSupabase();
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          if (
            uploadError.message.includes("Bucket not found") ||
            uploadError.message.includes("not found")
          ) {
            setMessage(
              "Storage bucket 'product-images' not found. Please create it in Supabase Storage first."
            );
            setSubmitting(false);
            return;
          }
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("products").insert({
        name,
        description: description || null,
        price: parseInt(price),
        category,
        is_new: isNew,
        image_url: imageUrl,
      });

      if (error) throw error;

      setName("");
      setDescription("");
      setPrice("");
      setCategory("Fashion");
      setIsNew(true);
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      setMessage("Product added successfully!");

      await fetchProducts();
    } catch (err: any) {
      setMessage(err.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const supabase = await getSupabase();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
      setMessage("Product deleted");
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <p className="text-black/50">Loading admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold">Regal Store</span>
            </Link>
            <span className="text-sm text-black/40 hidden sm:inline">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-black/50 hidden sm:inline">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm px-4 py-2 border border-black/10 rounded-full hover:bg-black/5 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {message && (
          <div className="mb-6 px-4 py-3 bg-black text-white text-sm rounded-xl flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
            <p className="text-sm text-black/50 mt-1">{products.length} products in store</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-black/80 transition"
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-black/5 p-6 mb-10 shadow-sm">
            <h2 className="text-lg font-medium mb-6">Add New Product</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Classic Oversized Polo"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#faf9f7] text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Price (₦) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    placeholder="12500"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#faf9f7] text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Short description of the product..."
                  className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#faf9f7] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#faf9f7] text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Home">Home</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">Mark as New</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Product Photo</label>
                <div className="flex items-start gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-black/15 rounded-xl p-6 text-center hover:border-black/30 transition">
                      <p className="text-sm text-black/50">
                        {imageFile ? imageFile.name : "Click to upload image"}
                      </p>
                      <p className="text-xs text-black/30 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-black/10">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-black/80 transition disabled:opacity-50"
              >
                {submitting ? "Adding product..." : "Add Product"}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
          {products.length === 0 ? (
            <div className="p-12 text-center text-black/40">
              No products yet. Click "Add Product" to create your first one.
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 hover:bg-black/[0.01]"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-black/30">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-black/40 mt-0.5">
                      {product.category} · {formatPrice(product.price)}
                      {product.is_new && (
                        <span className="ml-2 text-green-600">New</span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
          <p className="font-medium text-amber-900 mb-2">Important Setup Steps</p>
          <ol className="list-decimal list-inside space-y-1 text-amber-800">
            <li>
              Go to Supabase → Storage → Create a new bucket named{" "}
              <strong>product-images</strong>
            </li>
            <li>
              Make the bucket <strong>Public</strong>
            </li>
            <li>Run the storage policies SQL I gave you earlier</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
