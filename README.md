# EduAI — versi VS Code dari desain Figma

Proyek ini menggunakan kode React + TypeScript + Vite + Tailwind CSS yang ada di ZIP Figma yang diberikan. Tampilan dan alur halaman pada `src/App.tsx` dipertahankan sebagai sumber desain; konfigurasi lokal Figma Make saja yang diganti agar proyek bisa dijalankan di VS Code.

## Menjalankan di VS Code

1. Ekstrak ZIP ini.
2. Buka folder `EduAI-Figma-VSCode` di VS Code.
3. Pastikan Node.js versi 22.12 atau lebih baru sudah terpasang.
4. Buka Terminal → New Terminal.
5. Jalankan:

   ```bash
   npm install
   npm run dev
   ```

6. Buka alamat lokal yang tampil di terminal (umumnya `http://localhost:5173`).

## Catatan

- Jangan hanya menyalin `src/App.tsx`; jalankan proyek dari folder ini agar Tailwind dan Vite terkonfigurasi.
- Data dan alur aplikasi merupakan implementasi frontend/demo di kode sumber. Integrasi backend nyata perlu dikonfigurasi terpisah.
