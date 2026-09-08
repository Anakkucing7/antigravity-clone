# Dokumentasi Lengkap Arsitektur, Animasi & Teknologi Web Google Antigravity

Dokumen ini menjelaskan secara menyeluruh tentang arsitektur, teknologi, metodologi rekayasa web, sistem animasi visual, simulasi grafis 3D/WebGL, serta fitur-fitur interaktif yang diterapkan pada web **Google Antigravity**.

---

## 1. Ringkasan & Profil Website

Website ini merupakan salinan / *static export* interaktif dengan performa tinggi dari laman resmi **Google Antigravity** (`https://antigravity.google`).

* **Tema & Tujuan**: Platform agen AI generasi berikutnya (*next-generation agent-first platform*) buatan Google yang dirancang untuk pengembang (*developer*), enterprise, serta riset otomasi cerdas.
* **Paradigma Utama**: Mengusung konsep *"Experience liftoff with the next-gen agent platform"* dengan visual interaktif futuristik bernuansa minimalis Google, elemen partikel melayang (*gravity-defying*), tipografi adaptif, serta *smooth motion design* kelas dunia.
* **Lingkungan Lokal**: Web dijalankan secara lokal melalui *server* Node.js kustom (`server.js`) pada port `3000`.

---

## 2. Arsitektur & Tumpukan Teknologi (Tech Stack)

### A. Frontend Framework: Astro (Island Architecture)
Website ini dibangun dan di-*bundle* menggunakan **Astro**, terlihat dari artefak dan modul di direktori `_astro/`:
* **Islands Architecture**: Menggabungkan HTML statis ultra-cepat dengan komponen interaktif terisolasi (*islands*) yang hanya memuat JavaScript saat dibutuhkan.
* **Prefetch Engine (`_astro/page.LAbJoB63.js`)**:
  * Menggunakan `IntersectionObserver` dan *event listener* `mouseenter` / `touchstart` untuk melakukan *intelligent prefetching* tautan sebelum pengguna mengkliknya.
  * Memiliki deteksi koneksi lambat (`saveData` atau koneksi 2G) untuk mencegah beban data yang tidak diinginkan.

### B. Server Backend Lokal: Node.js Streaming Server (`server.js`)
Server lokal berbasis `http` murni tanpa dependensi berat (tanpa Express):
* **MIME Types Handlers**: Menangani `.html`, `.css`, `.js`, `.json`, `.png`, `.jpg`, `.svg`, `.mp4`, `.webm`, `.woff2`, dll.
* **HTTP 206 Partial Content (Video Range Streaming)**:
  * Mendukung *Range Requests* (`req.headers.range`) untuk file video (`.mp4` / `.webm`).
  * Menggunakan `fs.createReadStream(filePath, { start, end })` dengan header `Content-Range` dan `Accept-Ranges: bytes`. Hal ini memungkinkan *video scrubbing*, *instant seek*, dan *buffering* yang mulus di browser.
* **CORS Headers**: Menyematkan `Access-Control-Allow-Origin: *` pada semua response.

### C. Desain, Tipografi & Design System (Vanilla CSS)
* **Tokens Desain CSS Global (`BaseLayout.zSiu0WRx.css`)**:
  * Memanfaatkan CSS Custom Properties (`--palette-grey-*`, `--theme-surface-*`, `--theme-primary-*`).
  * Sistem palet adaptif bertingkat Google Design System yang mendukung kontras presisi tinggi.
* **Tipografi Modern**:
  * **Google Sans Flex**: Font sans-serif variabel fleksibel (`opsz`, `slnt`, `wdth`, `wght`, `ROND`).
  * **Google Sans Code**: Font monospace variabel untuk elemen kode dan aksen teknis.
  * **Google Symbols**: Ikonografi vektor berbasis font modern dengan `font-variation-settings: "FILL" 0..1, "wght" 300..400`.
* **Sistem Grid 12 Kolom Responsif**:
  * Breakpoints: `xs` (<= 425px), `sm` (<= 767px), `md` (<= 1024px), `lg` (<= 1440px), `xl` (<= 1600px).
  * Flexbox modular dengan variabel `--grid-gutter`, `--page-margin`, dan utilitas `.col-md-*`.

---

## 3. Sistem Grafis 3D & Simulasi Partikel WebGL (Three.js & GPGPU)

Salah satu keunggulan terbesar web ini terletak pada sistem simulasi partikel komputasi GPU (*GPGPU*) yang dibangun di atas **Three.js** (`_astro/Mouse.ZrlRGzn3.js`).

### A. Main Particles Component (Simulasi Partikel Hero & Footer)
File: `_astro/MainParticlesComponent.astro_astro_type_script_index_0_lang.Dox42TL8.js`

1. **Distribusi Poisson Disk Sampling**:
   * Menghasilkan sebaran partikel yang organik, alami, dan tidak saling tumpuk (*uniform random distribution*) menggunakan algoritma *Poisson Disk Sampling* pada matriks 500x500.
2. **Teknik Komputasi GPGPU (Ping-Pong Buffers)**:
   * Koordinat partikel tidak dihitung di CPU, melainkan disimpan dalam **DataTexture** Float32 berukuran 256x256 (65.536 titik partikel potensial).
   * Menggunakan 2 buah *RenderTarget* (`rt1` dan `rt2`) yang saling bergantian membaca dan menulis (*ping-pong rendering*) setiap frame.
3. **Custom GLSL Shader (Simplex Noise)**:
   * **Simulation Shader (`simMaterial`)**:
     * Menggunakan fungsi matematika Simplex Noise (`snoise`) 3 dimensi untuk mensimulasikan dinamika fluida bergelombang.
     * Mengkalkulasi interaksi cincin gravitasi (`uRingPos`, `uRingRadius`, `uRingWidth`, `uRingDisplacement`).
     * Menghitung kecepatan partikel (*velocity*) dan skala partikel (*scale*) secara real-time di GPU.
   * **Render Shader (`renderMaterial`)**:
     * Membaca posisi terbaru dari tekstur simulasi, lalu menggambar titik-titik partikel dengan pencampuran warna dinamis (`uColor1`, `uColor2`, `uColor3`) sesuai tema *light* atau *dark*.

### B. Morphing Particles Component (Transformasi Partikel Solusi)
File: `_astro/MorphingParticlesComponent.astro_astro_type_script_index_0_lang.B4r3VvfF.js`

1. **Ekstraksi Tekstur Gambar ke Data Titik**:
   * Membaca gambar ikon/vektor (misal `/assets/textures/icons/individual.png` dan `cube.png`).
   * Menggambar ke Canvas 2D tersembunyi untuk mengambil `ImageData` pikselnya.
2. **Pemrosesan Asinkron dengan Web Worker**:
   * Perhitungan ribuan titik dipindahkan ke **Web Worker** berbasis *Blob Object URL* agar tidak memblokir antarmuka utama (*main thread* / 60 FPS tetap terjaga).
   * Menggunakan *Poisson Disk Sampling* dengan *distance function* adaptif terhadap nilai densitas piksel merah:
     $$\text{pixel} = \frac{\text{data}[index]}{255} \implies \text{weight} = \text{pixel}^3$$
   * Mencari *nearest neighbor point* antara titik partikel dasar dan titik ikon.
3. **Morphing State on Hover**:
   * Ketika kursor mouse memasuki kartu solusi (`[data-solution-section]`), seragam shader `uIsHovering` bertransisi.
   * Partikel yang semula melayang bebas berkumpul secara mulus membentuk pola ikon kubus (*organization*) atau siluet figur (*developer*), lalu kembali terurai saat kursor keluar (*mouseleave*).

---

## 4. Sistem Animasi & Interaktivitas Lengkap

Web ini menggunakan pustaka animasi industri **GSAP (GreenSock Animation Platform)** bersama serangkaian *plugin* resminya.

| Library / Plugin | File Bundle | Fungsi Utama |
| :--- | :--- | :--- |
| **GSAP Core** | `gsap.Bi_c5vh2.js` | Mesin tweening, timeline kontrol, easing curves (`power1`, `power2`, `power3`, `back.out`). |
| **ScrollTrigger** | `ScrollTrigger.BTGKJApg.js` | Pemicu animasi berbasis scroll viewport, scrub progress, pinning, enter/leave hooks. |
| **ScrollSmoother** | `SmoothScrollLayout.astro...` | Inertial smooth scrolling, koordinasi parallax speed/lag, normalisasi sentuhan. |
| **SplitText** | `SplitText.Bj_bHxnY.js` | Memecah teks judul dan paragraf menjadi elemen per kata dan per huruf (`chars, words`). |
| **Draggable & Inertia** | `Draggable.G44Hfzvd.js` | Interaksi geser (touch/drag swipe) dengan gaya gesek, resistance, dan snapping. |

---

### Rincian Setiap Efek Animasi:

### 1. Inersia Smooth Scrolling (`ScrollSmoother`)
* File: `_astro/SmoothScrollLayout.astro_astro_type_script_index_0_lang.BIBS_Ca_.js`
* Mengubah container `#smooth-wrapper` dan `#smooth-content` menjadi layer terakselerasi perangkat keras dengan transformasi `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, y, 0, 1)`.
* Parameter `smooth: 0.6` dan `smoothTouch: 0.1` memberikan sensasi melayang yang halus dan elegan saat pengguna menggulir halaman.
* Mendukung *deep-link hash navigation* otomatis yang menghitung offset posisi target (`top 80px`).

### 2. Animasi Typewriter dengan Kursor Melayang (`TypedHeader`)
* File: `_astro/TypedHeader.astro_astro_type_script_index_0_lang.BK7Om3wI.js`
* Menggunakan `SplitText` untuk memisahkan teks menjadi kumpulan huruf (`chars`).
* Huruf dimunculkan satu per satu dengan `stagger.each: 0.02 - 0.05`.
* **Kursor Dinamis Interaktif**: Di setiap kemunculan huruf (`onStart`), posisi kursor (`antigravity-cursor.png`) dihitung ulang secara presisi melalui CSS Variables `--cursor-pos-x` dan `--cursor-pos-y`, sehingga kursor fisik tampak benar-benar mengetikkan kata tersebut di layar.
* Jika diatur `data-cursor-persists="true"`, kursor tetap berada di akhir kalimat dan berkedip (*blinking cursor*).

### 3. Custom Magnetic Cursor Pill
* File: `_astro/CustomCursor.astro_astro_type_script_index_0_lang.HIixua-1.js` & `YoutubeVideoSection.astro...`
* Pada thumbnail kartu Use Cases dan Video Utama:
  * Kursor asli browser disembunyikan (`cursor: none`).
  * Elemen kursor kustom ("Watch case" + ikon play) muncul dengan animasi elastis `back.out(1.7)`.
  * Menggunakan `gsap.quickTo(cursor, "x")` dan `gsap.quickTo(cursor, "y")` dengan durasi `0.35s` dan `ease: power2.out`. Metode `quickTo` ini menghindari pembuatan tween baru di setiap pergerakan mouse, menghasilkan gerakan kursor magnetis berkecepatan 60-120 FPS tanpa lag.

### 4. Animasi Zoom Masuk Video Hero (`YoutubeVideoSection`)
* File: `_astro/YoutubeVideoSection.astro_astro_type_script_index_0_lang.CBT2SQlO.js`
* Video dimulai dengan ukuran diperkecil `scale: 0.5`.
* Saat di-scroll, `ScrollTrigger` dengan opsi `scrub: 1` membesarkan kontainer video secara bertahap hingga memenuhi ukuran proporsional penuh (`scale: 1`).
* Mengontrol pemutaran video secara otomatis: video di-play saat masuk viewport dan di-pause saat keluar viewport untuk menghemat bandwidth dan memori.

### 5. Sine-Wave Bouncer Parallax (`AgentFirst`)
* File: `_astro/AgentFirst.astro_astro_type_script_index_0_lang.DHglPJ15.js`
* Menampilkan deretan kartu fitur yang bergerak naik-turun menyerupai gelombang air berkelanjutan.
* **Metode Matematika**:
  $$\text{posisi}_y = \sin\left(\frac{c[i] + \text{phase}}{s} \cdot 2\pi\right) \times 35\text{px}$$
* Diperbarui melalui `gsap.quickSetter(element, "y", "px")` pada timeline berulang tanpa henti (*infinite loop*).
* Digabungkan dengan pergeseran horizontal sumbu X (`x: -250px`) saat di-scroll melalui *scrub parallax*.

### 6. Carousel Geser Berkemampuan Inersia (`Slider` & `LandingLatestBlogs`)
* File: `_astro/Slider.astro...` dan `_astro/LandingLatestBlogs.astro...`
* Menggunakan `Draggable` dengan modul `Inertia`:
  * Pengguna dapat melakukan *drag* atau *swipe* sentuhan dengan resistensi tepi (*edge resistance*).
  * Menghitung snap point otomatis berdasarkan lebar item dan jarak gutter.
  * Mendukung responsivitas kolom (1 kolom pada mobile, 2 kolom pada tablet, 3-4 kolom pada desktop).
  * Sinkronisasi deskripsi teks aktif dan pemicuan pengetikan ulang judul saat slide berpindah.

### 7. Efek Gravitas Terbalik pada Footer (`AntigravityFooter`)
* File: `_astro/AntigravityFooter.astro_astro_type_script_index_0_lang.DQIYDjYp.js`
* Di bagian footer SVG raksasa kata **"ANTIGRAVITY"**:
  * Huruf **'T'** (`#letter-T2`) dan **'Y'** (`#letter-Y`) memiliki ScrollTrigger tersendiri.
  * Ketika pengguna mencapai akhir halaman, kedua huruf ini melayang ke atas melawan gravitasi (`y: -60px`) secara scrub, memperkuat metafora *antigravity liftoff*.

---

## 5. Fitur Unik, UX, & Rekayasa Tambahan

### A. Logo Easter Egg (Menu Konteks Klik-Kanan)
File: `_astro/Header.astro_astro_type_script_index_0_lang.CcyS50QO.js`
* Jika pengguna mengklik kanan logo Google Antigravity di header, event `contextmenu` dicegat (`preventDefault`).
* Muncul menu konteks kustom elegan dengan opsi:
  1. **"Copy Logo as SVG"**: Menyalin kode SVG murni dari logo lengkap dengan filter efek gradien ke clipboard pengguna menggunakan `navigator.clipboard.writeText()`.
  2. **"Copy Wordmark"**: Menyalin elemen wordmark.
  3. Indikator status tombol berubah menjadi *"Copied!"* sesaat sebelum menutup otomatis.

### B. Smart Header Auto-Hide
* Memantau delta scroll vertikal:
  * Scroll ke bawah (`delta > 5px`): Header meluncur sembunyi ke atas (`hidden`).
  * Scroll ke atas (`delta < -5px`): Header kembali muncul dengan latar belakang transparan ber-blur (*frosted glass* / `backdrop-filter: blur(5px)`).

### C. Deteksi Otomatis Sistem Operasi (`deviceInfo.eHzC_0c8.js`)
* Memeriksa *User Agent* platform browser pengguna (`navigator.userAgent` & `navigator.platform`).
* Mengidentifikasi apakah pengguna menggunakan **MacOS (Apple Silicon vs Intel)**, **Windows**, atau **Linux**.
* Menyesuaikan tombol CTA unduhan di Hero dan Download Section:
  * Pengguna Mac: Menampilkan *"Download for Apple Silicon"* dan *"Download for Intel"*.
  * Pengguna Windows: Menampilkan ikon desktop Windows + *"Download for Windows"*.
  * Pengguna Linux: Menampilkan ikon terminal + tautan rilis Linux.

### D. Modal Pemutar Video YouTube Terintegrasi
* Tautan video YouTube dibuka melalui elemen HTML5 native `<dialog>` kustom yang disanitasi URL-nya (`watch?v=` diubah ke format embed `https://www.youtube.com/embed/...` lengkap dengan parameter `autoplay=1&mute=0`).
* Menampilkan transisi *backdrop fade-in* gelap semi-transparan dengan tombol tutup berbentuk kapsul mengambang.

---

## 6. Daftar & Struktur File Proyek

```
antigr/
├── _astro/                     # File hasil kompilasi modul Astro & aset JS/CSS
│   ├── MainParticlesComponent...js  # Simulasi GPGPU WebGL partikel hero & footer
│   ├── MorphingParticlesComponent...js # Partikel Three.js yang berubah bentuk (morphing)
│   ├── SmoothScrollLayout...js      # GSAP ScrollSmoother (smooth scrolling)
│   ├── ScrollTrigger...js           # GSAP ScrollTrigger plugin
│   ├── SplitText...js               # GSAP SplitText plugin untuk animasi kata/huruf
│   ├── Draggable...js               # GSAP Draggable + Inertia gesture engine
│   ├── gsap...js                    # GreenSock Animation Platform core
│   ├── TypedHeader...js             # Logika animasi typewriter + kursor pelacak
│   ├── CustomCursor...js            # Kursor bulat magnetik kustom
│   ├── Header...js                  # Logika navigasi, mega menu & logo easter egg
│   ├── Slider...js                  # Pengontrol slider responsif dengan snap
│   ├── UseCases...js                # Section interaktif Use Cases
│   ├── YoutubeVideoSection...js     # Logika zoom in video & modal player
│   ├── AgentFirst...js              # Animasi gelombang matematis sinewave bouncers
│   ├── DownloadSection...js         # Section download + deteksi sistem operasi
│   ├── AntigravityFooter...js       # Efek animasi huruf melayang di footer
│   ├── BaseLayout...css             # Variabel warna, reset CSS, tipografi, grid
│   ├── SmoothScrollLayout...css     # Gaya tata letak wrapper scroll halus
│   └── page...js                    # Mesin prefetch otomatis link halaman
├── assets/
│   ├── image/                  # Gambar thumbnail, logo antigravity, kursor kustom
│   ├── textures/icons/         # Tekstur PNG untuk sumber titik partikel (cube, individual)
│   └── video/                  # Video MP4 latar belakang (hero_video.mp4, an-ai-ide-core.mp4)
├── index.html                  # Dokumen HTML utama website
├── server.js                   # Web server streaming Node.js (Range Request HTTP 206)
├── fix_worker.js               # Script utilitas perbaikan runtime Worker Blob
└── DOKUMENTASI_WEB_ANTIGRAVITY.md # File dokumentasi ini
```

---

## 7. Kesimpulan Metodologi Rekayasa

Web Google Antigravity ini merupakan contoh implementasi rekayasa antarmuka modern yang menggabungkan:
1. **Performa Rendering Tinggi**: Beban komputasi visual dipindahkan ke GPU via WebGL & GPGPU Shaders serta multithreading Web Worker.
2. **Koreografi Animasi Presisi**: Setiap interaksi (scroll, kursor, hover, pergantian tab) dikendalikan secara matematis melalui GSAP Timeline dan kurva inersia.
3. **Detail Mikro (Micro-Interactions)**: Fitur kursor pelacak pengetikan, huruf footer yang melawan gravitasi, serta logo klik-kanan interaktif memberikan kesan eksklusif dan mendalam bagi pengguna.
