# Anon — Forum Diskusi Anonim Indonesia

Platform diskusi anonim untuk pengguna Indonesia. Berbagi cerita, bertanya, dan berdiskusi tanpa perlu daftar akun.

---

## Fitur

- 🔒 **100% Anonim** — tidak ada daftar akun, tidak ada login
- 💬 **Thread & Komentar** — buat thread, balas komentar, nested replies
- ⬆️ **Upvote / Downvote** — thread dan komentar, real-time
- ⭐ **Highlight Komentar** — pembuat thread bisa tandai komentar terbaik
- 🤖 **AI Moderator** — moderasi otomatis menggunakan Gemini Flash
- 🔍 **Pencarian** — cari thread berdasarkan kata kunci
- 📋 **Threads Saya** — lacak thread yang kamu buat (disimpan di browser)
- 📱 **Mobile-first** — didesain untuk tampilan mobile

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime |
| AI Moderasi | Google Gemini Flash |
| Hosting | Vercel |

---

## Cara Menjalankan Secara Lokal

### 1. Clone repo

```bash
git clone https://github.com/egachaernawan-lgtm/anon.git
cd anon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan kedua file migrasi secara berurutan:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rpc_functions.sql`

### 4. Isi environment variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
MASK_HMAC_SECRET=random_secret_min_32_chars
```

**Cara mendapatkan keys:**
- **Supabase keys** → Project Settings → API di dashboard Supabase
- **Gemini API key** → [aistudio.google.com](https://aistudio.google.com) → Get API key
- **MASK_HMAC_SECRET** → jalankan `openssl rand -hex 32`

### 5. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Deploy ke Vercel

1. Push repo ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables yang sama seperti `.env.local`
4. Deploy — selesai!

---

## Struktur Project

```
/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home feed
│   ├── [subcategory]/          # Subcategory feed
│   ├── thread/[id]/            # Thread detail
│   ├── buat/                   # Buat thread baru
│   ├── threads-saya/           # Thread milik kamu
│   ├── cari/                   # Pencarian
│   └── api/                    # API routes
├── components/                 # React components
├── lib/                        # Utilities (supabase, mask, moderation, dll)
├── types/                      # TypeScript types
└── supabase/migrations/        # SQL migration files
```

---

## Sistem Anonimitas

- Setiap pengunjung mendapat **UUID unik** yang disimpan di browser (localStorage + cookie)
- UUID didaftarkan ke database tanpa informasi identitas apapun
- Saat posting thread/komentar, UUID diubah menjadi **mask ID** seperti `AnonMerah47`
- Mask ID bersifat **per-thread** — mask yang sama di thread yang berbeda tidak bisa dilacak
- Pembuat thread mendapat **owner token** tersimpan di browser untuk aksi highlight dan tutup thread

---

## Lisensi

MIT
