"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="flex items-center justify-center min-h-screen">Loading...</p>;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Absensi XI2</h1>
          <p className="text-lg text-gray-600 mb-8">Silakan login untuk mengakses sistem absensi.</p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="bg-white shadow-sm p-4 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-0">Dashboard Absensi</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Selamat datang, {session.user?.name} ({session.user?.role})</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Scan QR Code</h2>
          <p className="text-gray-600 mb-4">Scan QR untuk mencatat absensi Anda.</p>
          <Link
            href="/qr-scan"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Mulai Scan
          </Link>
        </div>

        {session.user?.role === "guru" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Generate QR Code</h2>
            <p className="text-gray-600 mb-4">Buat QR code untuk sesi absensi kelas.</p>
            <Link
              href="/qr-generate"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Generate QR
            </Link>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Lihat Data Absensi</h2>
          <p className="text-gray-600 mb-4">Lihat riwayat absensi siswa atau diri sendiri.</p>
          <Link
            href="/attendance"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            View Attendance
          </Link>
        </div>
      </div>
    </div>
  );
}
