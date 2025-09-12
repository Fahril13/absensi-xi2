"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function QRScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "siswa") {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError("Masukkan QR Code");
      return;
    }
    if (!session) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/qr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: qrCode, userId: session.user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Absensi berhasil!");
      } else {
        setError(data.error || "Absensi gagal");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.role !== "siswa") return <p>Redirecting...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Scan QR Absensi</h1>
        <input
          type="text"
          placeholder="Paste QR Code atau URL di sini"
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4"
          disabled={loading}
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded mb-4"
        >
          {loading ? "Scanning..." : "Absen Sekarang"}
        </button>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <p className="text-xs text-gray-500 text-center">Atau scan QR menggunakan kamera phone</p>
      </div>
    </div>
  );
}