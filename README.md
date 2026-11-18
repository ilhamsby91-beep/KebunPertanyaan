# Penjaga Kebun - versi revisi

## Menjalankan game
1. Ekstrak ZIP.
2. Buka folder `penjaga-kebun-revisi` di Visual Studio Code.
3. Buka `index.html` dengan ekstensi Live Server, atau jalankan melalui server lokal.
4. Level yang sudah terbuka/selesai, total koin, dan bintang disimpan di `localStorage` browser. Sesi yang sedang berjalan akan dimulai ulang jika halaman dimuat ulang.

## Mekanik terbaru
- 6 level, masing-masing 3 hari.
- Setiap hari terdiri dari empat sesi: pagi, siang, sore, dan malam. Setiap level memiliki 3 hari × 4 sesi = 12 sesi.
- 5 baris kebun, masing-masing berisi 7 tanaman.
- Toko berisi 7 jenis bibit: Padi, Pisang, Jagung, Wortel, Stroberi, Anggur, dan Durian.
- Harga bibit sesuai permintaan: 2, 5, 8, 10, 15, 18, dan 20 koin.
- Bibit baru terbuka bertahap berdasarkan level. Bibit yang sudah dibeli bisa dipilih kembali kapan saja.
- Nilai jual panen otomatis: Padi 25, Pisang 50, Jagung 80, Wortel 110, Stroberi 160, Anggur 220, Durian 300 koin.
- Toko bibit dapat dibuka dari halaman utama atau tombol Toko Bibit saat bermain; sesi permainan tetap tersimpan ketika pemain membuka toko.
- Setiap baris mendapat satu soal per sesi.
- Distribusi soal seimbang: satu soal Matematika, Bahasa Inggris, IPS, IPA, dan Bahasa Indonesia per sesi.
- Jawaban benar menambah pertumbuhan 50%, jawaban salah menambah 10%.
- Target harian adalah 500 poin. Jawaban benar memberi 30 poin, jawaban salah tetap memberi 15 poin, dan panen memberi bonus 15 poin.
- Setiap hari terdiri dari 20 pertanyaan (5 baris × 4 sesi). Jika mencapai 500 poin, pemain mendapat bonus 50 koin dan 2 bintang. Target harian adalah target bonus, bukan hukuman atau pengunci permainan.
- Tidak ada hukuman atau pengurangan koin karena jawaban salah.
- Target penyelesaian level adalah 5 kali panen.

## Bank soal
Bank soal sudah dipisah menjadi 15 file JavaScript, berdasarkan kelas dan mapel:
- `questions/kelas-4/matematika.js`
- `questions/kelas-4/bahasa-inggris.js`
- `questions/kelas-4/ips.js`
- `questions/kelas-4/ipa.js`
- `questions/kelas-4/bahasa-indonesia.js`
- Struktur folder yang sama tersedia untuk kelas 5 dan kelas 6.

Setiap file berisi 600 soal. Totalnya 9.000 soal. Setiap soal ditulis vertikal, dengan satu properti per baris: `id`, `grade`, `subject`, `topic`, `question`, `options`, `answer`, dan `explanation`.

Untuk mengubah soal, buka file kelas dan mapel yang diinginkan, lalu edit objek soal secara langsung. `js/questions.js` sekarang hanya berisi pengatur bank soal dan fungsi pemilih soal, bukan isi bank soalnya.

Catatan: bank soal ini adalah bank awal berbasis konsep dan variasi pola. Sebelum dipakai secara resmi di sekolah, periksa kembali kesesuaian materi dengan kurikulum yang digunakan dan validasi jawaban oleh guru.

## Mengganti gambar bibit dan tanaman
Ikon bibit untuk toko:
`assets/seeds/`
- `padi.png`
- `pisang.png`
- `jagung.png`
- `wortel.png`
- `stroberi.png`
- `anggur.png`
- `durian.png`

Gambar tahap pertumbuhan setiap tanaman dipisah per jenis:
`assets/plants/<nama-tanaman>/`
- `stage-1.png` = bibit
- `stage-2.png` = mulai tumbuh
- `stage-3.png` = tanaman dewasa
- `harvest.png` = siap panen

Contoh: `assets/plants/padi/stage-1.png`.
Gunakan PNG transparan, disarankan ukuran 128x128 atau 256x256 piksel, rasio 1:1. Seluruh gambar bibit dan tanaman disediakan sebagai aset PNG. Game tidak menggunakan emoji sebagai gambar cadangan; pastikan file aset dengan nama yang benar tetap ada.

## Mengganti background hari
Simpan gambar latar di `assets/backgrounds/` dengan nama:
- `day-1-morning.png`
- `day-1-afternoon.png`
- `day-2-morning.png`
- `day-2-afternoon.png`
- `day-3-morning.png`
- `day-3-afternoon.png`

Gunakan gambar landscape, misalnya 1600x600 piksel. Lapisan warna pada CSS menjaga teks tetap terbaca. Untuk mengubah tampilan, edit aturan `.scene.day-X.morning` dan `.scene.day-X.afternoon` di `css/style.css`.

## Struktur folder
- `index.html`: kerangka halaman.
- `css/style.css`: seluruh tampilan dan background.
- `js/game.js`: mekanik, level, progres, hadiah, dan interaksi.
- `js/questions.js`: pengatur dan pemilih soal.
- `questions/kelas-4/`: lima file bank soal kelas 4.
- `questions/kelas-5/`: lima file bank soal kelas 5.
- `questions/kelas-6/`: lima file bank soal kelas 6.
- `assets/plants/`: gambar empat tahap untuk setiap jenis tanaman.
- `assets/seeds/`: ikon bibit yang tampil di toko.
- `assets/backgrounds/`: gambar latar pagi, siang, sore, dan malam.
- `assets/illustrations/`: ilustrasi kebun untuk halaman utama.

## Catatan teknis
Game ini masih berjalan lokal di browser. Penyimpanan menggunakan `localStorage`, sehingga progres tersimpan di browser/perangkat yang sama. Untuk akun banyak pengguna dan sinkronisasi antarperangkat, diperlukan backend/database.

## Mengganti background pagi, siang, sore, malam
Masukkan gambar buatan sendiri ke `assets/backgrounds/`:
- `morning.png`
- `noon.png`
- `afternoon.png`
- `night.png`

Saran ukuran 1920 x 650 piksel (landscape). Background dipilih otomatis berdasarkan sesi permainan, bukan jam komputer. Dalam satu hari, urutannya adalah pagi → siang → sore → malam. Setelah malam, permainan berpindah ke pagi hari berikutnya.

Jika gambar belum tersedia, game tetap menampilkan background gradasi bawaan CSS.

## Mengganti ilustrasi halaman utama
Ilustrasi halaman utama menggunakan `assets/illustrations/hero-garden.svg`. Background suasana menggunakan file SVG di `assets/backgrounds/`.

## Toko bibit dan target harian
Toko bibit menampilkan harga beli, syarat level pembuka, dan hasil koin saat panen. Bibit yang sudah dimiliki dapat dipilih tanpa membeli ulang. Saat membuka toko dari tombol di dalam permainan, sesi yang sedang berjalan tidak dihapus.

Target harian 500 poin dihitung ulang setiap pagi. Jawaban benar memberi 30 poin, jawaban salah tetap memberi 15 poin, dan panen memberi tambahan 15 poin. Jika target tercapai setelah sesi malam, pemain mendapat bonus 50 koin dan 2 bintang. Target ini tidak mengunci hari berikutnya agar pemain tidak dihukum karena salah menjawab.


## Aset ilustrasi antarmuka
Folder `assets/ui/` berisi ilustrasi gambar untuk koin, bintang, waktu, cuaca, pupuk, alat penyiram, keranjang panen, status level, dan elemen lain. Semua elemen tersebut ditampilkan sebagai file gambar, bukan emoji atau ikon teks.

Gambar tanaman dibuat terpisah di `assets/seeds/` dan `assets/plants/`. Kostum profil dapat diganti di `assets/profile-costumes/` dengan mempertahankan nama file PNG yang sudah digunakan.
