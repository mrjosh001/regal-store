# Regal Store

Premium product catalog / e-commerce website for Nigeria.

Built with **Next.js**, **Supabase**, **Tailwind CSS**, and a Shopify-inspired design system.

## Features (current)
- Clean product grid inspired by QAFRICA
- Category filters
- Search bar
- Responsive design
- Ready for Supabase products table

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/mrjosh001/regal-store.git
cd regal-store
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the example file and fill in your Supabase keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://mktdgboqexfxllsxydjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

> Use the **anon / publishable** key (not the secret key).

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
src/
  app/           → Pages (App Router)
  lib/supabase/  → Supabase clients
```

## Next Steps
- Connect real products from Supabase
- Add authentication
- Deploy to Vercel

---

**Brand:** Regal Store  
**Design system:** Shopify-inspired (see DESIGN.md)
