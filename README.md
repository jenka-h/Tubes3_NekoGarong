# Judol Detector
Ekstensi _chromium-based_ yang dapat mendeteksi konten berunsur judi _online_ dengan menggunakan algoritma _pattern/exact matching_, _regex matching_, dan _fuzzy matching_ terhadap teks-teks serta gambar yang ada pada halaman web yang sedang dibuka.

## Penjelasan Algoritma
Ekstensi ini menggunakan algoritma Knuth-Morris-Pratt (KMP) dan Boyer-Moore (BM) sebagai algoritma untuk memecahkan masalah _pattern matching_ pada suatu teks.

Algoritma Knuth-Morris-Pratt (KMP) bekerja dengan cara memindai pattern dari kiri ke kanan.  Ketika terjadi ketidakcocokan (mismatch) antara pattern P dan teks T, algoritma KMP tidak mengulang perbandingan yang telah dilakukan sebelumnya, melainkan memanfaatkan informasi dari karakter-karakter yang sudah dicocokkan untuk menentukan seberapa jauh pattern harus digeser.

Algoritma Boyer-Moore memindai karakter pattern dari kanan ke kiri (looking-glass technique), dimulai dari karakter terakhir pattern. Pendekatan ini memungkinkan Boyer-Moore untuk melewati lebih banyak karakter teks sekaligus, menggunakan heuristik Bad Character dan Good Suffix, sehingga dalam banyak kasus praktis menjadi jauh lebih cepat dari algoritma lainnya.

Terdapat juga algoritma Aho-Corasick dan Rabin-Karp yang telah terimplementasi dalam ekstensi ini. Penjelasan lebih lanjut untuk setiap algoritma dapat dilihat pada dokumen pada folder doc.

## _Requirement_
### 1) Node.js + npm
Unduh dan instal dari tautan https://nodejs.org (versi LTS). Cek instalasi dengan perintah terminal berikut. 
```bash
node -v
npm -v
```
### 2) Browser berbasis Chromium
Ekstensi ini dibuat untuk dapat dijalankan pada browser berbasis Chromium, seperti Google Chrome (https://www.google.com/chrome/) dan Microsoft Edge (https://www.microsoft.com/edge)
### 3) _Project Dependencies_
_Dependency_ program perlu di-_install_ terlebih dahulu sebelum bisa di-_build_ dengan perintah terminal berikut.
```bash
npm install
```

## _Build_ dan _Run_
Program dapat di-_build_ setelah _requirement_ di atas terpenuhi dengan perintah terminal:
```bash
npm run build
```
Hasil _build_ akan masuk ke dalam folder _dist_ dan siap diterapkan ke dalam browser. Cara menerapkan ekstensi ke dalam browser Google Chrome adalah sebagai berikut.

1. Buka browser Google Chrome
2. Masuk ke halaman chrome://extensions/
3. Aktifkan opsi Developer Mode
4. Tekan tombol Load Unpacked
5. Pilih folder `dist/`, tempat hasil build tersimpan

## _Author_
- Faiq Azzam Nafidz (13524003)
- Muhammad Nafis Habibi (13524018)
- Jennifer Khang (13524110)