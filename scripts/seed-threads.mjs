/**
 * Seed script — inserts realistic Indonesian threads into every subcategory.
 * Run: node scripts/seed-threads.mjs
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { createHmac, createHash } from 'crypto'
import { randomUUID } from 'crypto'

// ── Load .env.local ──────────────────────────────────────────────────────────
const env = {}
try {
  readFileSync('.env.local', 'utf8').split('\n').forEach((line) => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('Could not read .env.local'); process.exit(1)
}

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY'],
)

// ── Mask ID helpers (mirrors lib/mask.ts) ────────────────────────────────────
const ADJECTIVES = [
  'Merah','Biru','Hijau','Emas','Perak','Ungu','Oranye','Hitam','Putih','Abu',
  'Coklat','Krem','Marun','Tosca','Nila','Magenta','Cyan','Indigo','Lavender','Coral',
  'Terang','Gelap','Cerah','Suram','Lembut','Kuat','Cepat','Lambat','Tinggi','Rendah',
  'Besar','Kecil','Panjang','Pendek','Lebar','Sempit','Dalam','Dangkal','Tajam','Tumpul',
  'Manis','Pahit','Asam','Asin','Pedas','Segar','Harum','Wangi','Lezat','Gurih',
]

function getMaskId(threadId, userUuid) {
  const hmac = createHmac('sha256', env['MASK_HMAC_SECRET'] ?? 'secret')
  hmac.update(`${threadId}:${userUuid}`)
  const hex = hmac.digest('hex')
  const adjIdx = parseInt(hex.slice(0, 8), 16) % ADJECTIVES.length
  const num = parseInt(hex.slice(8, 12), 16) % 100
  return `Anon${ADJECTIVES[adjIdx]}${num}`
}

function hashOwnerToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

// ── Seed data ────────────────────────────────────────────────────────────────
const THREADS = [
  // Sepak Bola
  {
    slug: 'sepak-bola',
    title: 'Siapa pemain terbaik Timnas Indonesia saat ini?',
    content: 'Menurut kalian siapa yang paling konsisten penampilannya? Gue pribadi ngerasa Marselino lagi on fire belakangan ini, tapi Egy juga nggak kalah. Atau ada yang lebih jagokan pemain lain? Diskusi yuk.',
  },
  {
    slug: 'sepak-bola',
    title: 'Liga 1 musim ini kualitasnya gimana menurut kalian?',
    content: 'Nonton langsung beberapa pertandingan Liga 1 kemarin, overall agak kecewa sama pace permainannya. Terlalu lambat dan banyak diving. Atau mungkin ekspektasi gue yang terlalu tinggi? Ada yang punya opini berbeda?',
    upvotes: 14, downvotes: 3, comment_count: 8,
  },

  // Basket
  {
    slug: 'basket',
    title: 'NBA Finals tahun ini: siapa yang kalian jagokan?',
    content: 'Udah masuk babak playoff nih. Gue masih yakin Celtics bakal konsisten, tapi Warriors dengan Curry yang lagi balik form kayaknya bisa jadi dark horse. Kalian team siapa?',
    upvotes: 22, downvotes: 1, comment_count: 15,
  },
  {
    slug: 'basket',
    title: 'Tips buat yang baru mau mulai belajar basket dari nol',
    content: 'Baru beli bola basket dan mau serius latihan. Udah 20 tahun tapi belum pernah beneran main. Kira-kira harus mulai dari mana ya? Mending cari komunitas dulu atau latihan sendiri sambil nonton tutorial YouTube?',
    upvotes: 5, downvotes: 0, comment_count: 6,
  },

  // Badminton
  {
    slug: 'badminton',
    title: 'Kekalahan Kevin/Marcus di All England kemarin — analisis jujur',
    content: 'Bukan mau nyalahin siapa-siapa tapi emang kelihatan banget stamina mereka drop di set ketiga. Padahal head-to-head sama pasangan China itu harusnya kita unggul. Ada yang nonton live? Menurut kalian kesalahannya di mana?',
    upvotes: 31, downvotes: 4, comment_count: 19,
  },

  // Film & Series
  {
    slug: 'film-series',
    title: 'Film Indonesia yang worth it ditonton di bioskop tahun ini',
    content: 'Lagi nyari rekomendasi film lokal yang beneran bagus, bukan yang cuma hype doang. Tahun ini udah ada yang nonton apa dan worthed? Genre apa aja boleh, horror, drama, komedi. Share pengalaman kalian!',
    upvotes: 18, downvotes: 2, comment_count: 24,
  },
  {
    slug: 'film-series',
    title: 'Series Netflix yang bikin susah tidur karena terlalu seru',
    content: 'Baru kelar marathon Squid Game season 2 semalam dan sekarang nggak bisa tidur karena overthinking endingnya. Ada rekomendasi series lain yang bikin adiktif gitu? Gue suka thriller psychological.',
    upvotes: 42, downvotes: 3, comment_count: 33,
  },

  // Musik
  {
    slug: 'musik',
    title: 'Lagu Indonesia mana yang paling sering kalian re-play bulan ini?',
    content: 'Playlist gue bulan ini hampir 80% diisi satu lagu doang sampe bosen sendiri wkwk. Kalian lagi obsessed sama lagu apa? Boleh genre apa aja — pop, indie, R&B, metal, bebas.',
    upvotes: 27, downvotes: 0, comment_count: 41,
  },
  {
    slug: 'musik',
    title: 'Konser mana yang paling sayang dilewatkan tahun ini?',
    content: 'Denger-denger banyak artis internasional yang bakal mampir ke Jakarta tahun ini. Udah ada yang beli tiket? Atau ada info konser yang belum banyak yang tau? Share di sini biar kita bisa info-info.',
    upvotes: 15, downvotes: 1, comment_count: 12,
  },

  // Gaming
  {
    slug: 'gaming',
    title: 'Game mobile yang lagi seru dimainkan — rekomendasi dong',
    content: 'Bosan sama game yang itu-itu aja. Lagi nyari game mobile baru yang bisa dimainkan solo maupun bareng teman, nggak harus yang baru rilis. Genre strategy atau RPG lebih prefer tapi boleh kasih rekomendasi apa aja.',
    upvotes: 9, downvotes: 1, comment_count: 28,
  },
  {
    slug: 'gaming',
    title: 'PC gaming budget 10 juta, build apa yang paling worth?',
    content: 'Mau upgrade dari laptop gaming ke PC desktop. Budget sekitar 10 juta all-in termasuk monitor. Target bisa main game AAA di 1080p 60fps stabil. Ada yang bisa kasih rekomendasi build atau toko yang terpercaya?',
    upvotes: 36, downvotes: 2, comment_count: 22,
  },

  // K-Pop
  {
    slug: 'kpop',
    title: 'Comeback album mana yang paling kalian tunggu-tunggu?',
    content: 'Jadwal comeback Q2 ini padat banget. Gue pribadi paling nunggu-nunggu yang satu ini karena konsep teaser-nya udah terlalu menarik. Kalian waiting for siapa? Cerita dong kenapa excited!',
    upvotes: 19, downvotes: 0, comment_count: 37,
  },

  // Anime
  {
    slug: 'anime',
    title: 'Anime season ini yang wajib ditonton — ranking versi kalian',
    content: 'Udah pertengahan season dan udah beberapa episode yang rilis. Dari yang lagi airing, mana yang menurut kalian paling worth diikutin sampe selesai? Gue lagi coba ikutin 4 sekaligus tapi mulai kewalahan wkwk.',
    upvotes: 28, downvotes: 1, comment_count: 31,
  },
  {
    slug: 'anime',
    title: 'One Piece arc terbaru: hype atau memang sebagus itu?',
    content: 'Banyak yang bilang arc ini salah satu terbaik dalam sejarah One Piece. Gue baru mulai nonton dan emang nggak bisa berhenti. Tapi ada juga yang bilang terlalu hype. Kalian yang udah kejar gimana pendapatnya?',
    upvotes: 44, downvotes: 5, comment_count: 47,
  },

  // Hubungan
  {
    slug: 'hubungan',
    title: 'LDR 2 tahun — gimana cara kalian tetap connected sama pasangan?',
    content: 'Lagi LDR beda pulau dan mulai ngerasa jarak bukan cuma soal kilometer tapi juga komunikasi yang makin renggang. Ada yang punya tips nyata buat tetap bonding selain video call rutin? Agak desperate nih hehe.',
    upvotes: 33, downvotes: 0, comment_count: 28,
  },
  {
    slug: 'hubungan',
    title: 'Red flag yang sering diabaikan di awal hubungan',
    content: 'Setelah putus dari hubungan 3 tahun, gue baru sadar ada banyak tanda-tanda yang harusnya gue perhatiin dari awal. Pengen sharing dan juga denger pengalaman kalian — red flag apa yang pernah kalian ignore dan nyesel belakangan?',
    upvotes: 67, downvotes: 2, comment_count: 54,
  },

  // Keluarga
  {
    slug: 'keluarga',
    title: 'Cara halus nolak pertanyaan "kapan nikah" dari keluarga besar',
    content: 'Lebaran tinggal beberapa bulan lagi dan gue udah anxiety duluan ngebayangin dikerubungin pertanyaan itu dari om tante. Udah 28 tahun dan masih single. Ada yang punya jawaban jitu yang nggak nyinggung tapi bisa nutup topik?',
    upvotes: 89, downvotes: 1, comment_count: 72,
  },

  // Kesehatan Mental
  {
    slug: 'kesehatan-mental',
    title: 'Overthinking tengah malam — ada yang punya cara ampuh ngatasinnya?',
    content: 'Hampir tiap malam otak gue malah aktif pas mau tidur. Mikirin hal-hal yang udah lewat, yang belum tentu terjadi, sampe hal random yang nggak jelas. Udah coba journaling tapi tetep aja. Ada yang relate? Atau ada yang berhasil nemuin solusinya?',
    upvotes: 95, downvotes: 0, comment_count: 63,
  },

  // Curhat
  {
    slug: 'curhat',
    title: 'Ngerasa stuck dan nggak berkembang padahal udah usaha keras',
    content: 'Udah setengah tahun ngerasa jalan di tempat. Kerjaan oke, finansial stabil, tapi ada rasa kosong yang nggak bisa dijelasin. Kayak hidup berjalan tapi gue nggak ngerasa terlibat di dalamnya. Pernah ada yang ngerasa kayak gini? Itu normal nggak sih?',
    upvotes: 78, downvotes: 1, comment_count: 49,
  },

  // Kuliah
  {
    slug: 'kuliah',
    title: 'Skripsi vs dunia kerja — mending mana yang diprioritasin?',
    content: 'Semester ini lagi ngerjain skripsi tapi dapet tawaran magang yang lumayan banget di startup. Dua-duanya nggak bisa dikerjain penuh. Kalian di posisi gue bakal pilih mana? Atau ada yang punya pengalaman manage keduanya?',
    upvotes: 41, downvotes: 3, comment_count: 35,
  },
  {
    slug: 'kuliah',
    title: 'Jurusan yang katanya prospek bagus tapi ternyata susah cari kerja',
    content: 'Jujur ngerasa ketipu sama ekspektasi pas milih jurusan dulu. Banyak yang bilang prospeknya bagus tapi realitanya susah banget masuk industri. Ada yang ngerasa sama? Atau ada yang berhasil break in dengan cara yang nggak biasa?',
    upvotes: 55, downvotes: 4, comment_count: 44,
  },

  // Karir
  {
    slug: 'karir',
    title: 'Resign dari kerjaan nyaman demi ikut passion — worth it nggak?',
    content: 'Udah 4 tahun di perusahaan yang stabil, gaji oke, tapi nggak ada growth dan tiap hari kerja ngerasa hampa. Ada kesempatan buat pindah ke bidang yang beneran gue suka tapi gajinya mungkin turun 30%. Kalian pernah ada di posisi ini? Apa keputusan kalian?',
    upvotes: 82, downvotes: 5, comment_count: 67,
  },

  // Beasiswa
  {
    slug: 'beasiswa',
    title: 'Tips lolos seleksi LPDP dari orang yang udah berhasil',
    content: 'Alhamdulillah baru aja dapet LoA dan lulus seleksi LPDP untuk program S2 luar negeri. Mau sharing beberapa hal yang menurut gue krusial di proses seleksinya. Kalian yang lagi persiapan boleh tanya-tanya!',
    upvotes: 124, downvotes: 0, comment_count: 88,
  },

  // Gadget
  {
    slug: 'gadget',
    title: 'iPhone vs Android di 2025 — honestly mana yang lebih worth?',
    content: 'Lagi mau ganti HP dan bingung antara iPhone 16 atau flagship Android. Keduanya udah nyobain jangka panjang? Gue lebih ke arah daily driver untuk kerja dan foto. Bukan mau debat brand, cuma mau tau pengalaman nyata kalian.',
    upvotes: 38, downvotes: 6, comment_count: 52,
  },
  {
    slug: 'gadget',
    title: 'Review jujur earbuds wireless di bawah 500rb',
    content: 'Udah nyobain beberapa earbuds wireless murah buat cari yang paling worth buat dipakai kerja dari rumah. Ada yang punya experience bagus atau buruk dengan brand tertentu? Terutama soal koneksi stabil dan kualitas mic untuk call.',
    upvotes: 16, downvotes: 1, comment_count: 18,
  },

  // Coding
  {
    slug: 'coding',
    title: 'Bahasa pemrograman yang paling worth dipelajari untuk pemula di 2025',
    content: 'Mau serius belajar coding tapi bingung mulai dari mana. Udah baca banyak artikel tapi masing-masing rekomendasiin hal berbeda. Background gue non-IT tapi tertarik ke web development. Ada yang bisa kasih arah yang jelas?',
    upvotes: 47, downvotes: 2, comment_count: 39,
  },
  {
    slug: 'coding',
    title: 'Pengalaman kerja sebagai freelance developer — jujur enak atau nggak?',
    content: 'Udah setahun jadi full-time freelance developer setelah resign dari kantor. Mau cerita pengalaman jujur — enaknya, susahnya, dan hal yang nggak gue expect sebelumnya. Kalian yang lagi consider freelance boleh tanya-tanya.',
    upvotes: 63, downvotes: 1, comment_count: 45,
  },

  // Startup
  {
    slug: 'startup',
    title: 'Fenomena startup Indonesia yang bangkrut — pelajaran apa yang bisa diambil?',
    content: 'Beberapa tahun terakhir banyak startup yang tadinya dianggap unicorn sekarang tutup atau skala besar-besaran. Dari sudut pandang kalian — baik sebagai konsumen, karyawan, atau founder — apa pelajaran terbesar yang bisa diambil?',
    upvotes: 71, downvotes: 3, comment_count: 58,
  },

  // Random
  {
    slug: 'random',
    title: 'Kebiasaan aneh yang kalian lakuin tapi nggak pernah cerita ke siapapun',
    content: 'Gue punya kebiasaan ngurutkan makanan di piring berdasarkan warna sebelum makan wkwk. Tahu itu aneh tapi nggak bisa berhenti. Ada yang punya kebiasaan random yang selama ini disimpen sendiri? Ini judgeement free zone!',
    upvotes: 103, downvotes: 0, comment_count: 97,
  },
  {
    slug: 'random',
    title: 'Makanan yang kelihatannya aneh tapi ternyata enak banget',
    content: 'Kemarin nggak sengaja nyobain kombinasi makanan yang menurut orang-orang di sekitar gue "menjijikkan" tapi ternyata enak banget. Kalian pernah nemuin hidden gem makanan yang nggak biasa? Spill dong!',
    upvotes: 44, downvotes: 2, comment_count: 61,
  },

  // Pertanyaan Aneh
  {
    slug: 'pertanyaan-aneh',
    title: 'Kalau bisa ngobrol sama diri sendiri 10 tahun lalu, apa yang bakal kalian bilang?',
    content: 'Pertanyaan filosofis yang lagi gue renungin tengah malam. Bukan soal penyesalan, tapi lebih ke — kalau kamu bisa kasih satu nasihat ke diri kamu yang lebih muda, apa itu? Dan apakah kamu pikir versi muda kamu bakal dengerin?',
    upvotes: 86, downvotes: 0, comment_count: 73,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function randomPastDate(maxDaysAgo = 14) {
  const ms = Date.now() - Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000
  return new Date(ms).toISOString()
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Fetch subcategory slug → id map
  const { data: subcats, error: scErr } = await supabase
    .from('subcategories')
    .select('id, slug')

  if (scErr) { console.error('Failed to fetch subcategories:', scErr.message); process.exit(1) }

  const slugToId = Object.fromEntries(subcats.map((s) => [s.slug, s.id]))

  // Create a shared seed user
  const seedUserUuid = 'aaaaaaaa-seed-seed-seed-aaaaaaaaaaaa'
  await supabase.from('users').upsert({ id: seedUserUuid, last_seen: new Date().toISOString() })

  let inserted = 0

  for (const thread of THREADS) {
    const subcategoryId = slugToId[thread.slug]
    if (!subcategoryId) { console.warn(`Unknown slug: ${thread.slug}`); continue }

    const threadId = randomUUID()
    const authorUuid = randomUUID() // unique anonymous author per thread
    await supabase.from('users').upsert({ id: authorUuid, last_seen: new Date().toISOString() })

    const maskId = getMaskId(threadId, authorUuid)
    const ownerToken = randomUUID()
    const ownerTokenHash = hashOwnerToken(ownerToken)

    const { error } = await supabase.from('threads').insert({
      id: threadId,
      subcategory_id: subcategoryId,
      title: thread.title,
      content: thread.content,
      author_uuid: authorUuid,
      owner_token_hash: ownerTokenHash,
      mask_id: maskId,
      status: 'open',
      upvotes: thread.upvotes ?? Math.floor(Math.random() * 30),
      downvotes: thread.downvotes ?? Math.floor(Math.random() * 5),
      comment_count: thread.comment_count ?? Math.floor(Math.random() * 20),
      created_at: randomPastDate(),
    })

    if (error) {
      console.error(`  ✗ ${thread.title.slice(0, 50)}:`, error.message)
    } else {
      console.log(`  ✓ [${thread.slug}] ${thread.title.slice(0, 55)}`)
      inserted++
    }
  }

  console.log(`\nDone! ${inserted}/${THREADS.length} threads inserted.`)
}

main()
