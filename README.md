# Absensi XI-2 - Attendance System

Sistem absensi berbasis QR Code untuk kelas XI-2 menggunakan Next.js, MongoDB, dan autentikasi NextAuth.

## Fitur Utama

- ✅ **Pemindaian QR Code** - Siswa dapat melakukan absensi dengan memindai QR code
- ✅ **Dashboard Guru** - Melihat daftar absensi semua siswa
- ✅ **Riwayat Absensi Siswa** - Siswa dapat melihat riwayat absensi mereka
- ✅ **Status Absensi Real-time** - Hadir, Tidak Hadir, Izin, Sakit
- ✅ **Reset Otomatis** - Absensi direset setiap hari pukul 6 pagi
- ✅ **Sistem 30+ Siswa** - Mendukung banyak siswa dalam satu kelas

## Sistem Kerja

1. **Siswa yang scan QR** → Status: **Hadir**
2. **Siswa yang tidak scan QR** → Status: **Tidak Hadir**
3. **Setiap hari pukul 6 pagi** → Semua siswa direset ke **Tidak Hadir**
4. **Dashboard menampilkan semua siswa** dengan status terkini

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install && yarn dev
# or
pnpm install && pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setup Database

1. Pastikan MongoDB sudah terinstall dan running
2. Copy `.env.local.example` ke `.env.local` dan isi konfigurasi database
3. Jalankan seeding untuk membuat data siswa awal:

```bash
npm run seed
```

## Reset Absensi Harian

Untuk mereset absensi setiap hari pukul 6 pagi, setup cron job:

### Linux/Mac:
```bash
# Edit crontab
crontab -e

# Tambahkan baris berikut (sesuaikan path)
0 6 * * * cd /path/to/absensi-xi2 && npm run reset-attendance
```

### Windows (Task Scheduler):
1. Buka Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 6:00 AM
4. Set action: Start a program
5. Program/script: `cmd.exe`
6. Arguments: `/c cd /d "C:\path\to\absensi-xi2" && npm run reset-attendance`

### Manual Reset:
```bash
npm run reset-attendance
```

## API Endpoints

- `GET /api/attendance` - Mendapatkan daftar absensi
- `POST /api/qr/scan` - Memproses pemindaian QR
- `POST /api/attendance/reset` - Mereset semua absensi (untuk testing)

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB dengan Mongoose
- **Authentication**: NextAuth.js
- **QR Code**: qrcode, @zxing/library

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
