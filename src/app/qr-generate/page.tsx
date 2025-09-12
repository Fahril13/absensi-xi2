"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function QRGeneratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrSvg, setQrSvg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "guru") {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleGenerateQR = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setQrSvg(data.qrCode);
        // Optional: Show the absen URL for manual entry
        if (data.absenUrl) {
          console.log("Absen URL: " + data.absenUrl);
        }
      } else {
        setError(data.error || "Gagal generate QR");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.role !== "guru") return <p>Redirecting...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Generate QR Absensi</h1>
        <button
          onClick={handleGenerateQR}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded mb-4"
        >
          {loading ? "Generating..." : "Generate QR Code"}
        </button>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {qrSvg && (
          <div className="text-center">
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="mx-auto mb-4" />
            <p className="text-sm text-gray-600">Scan QR ini untuk absensi</p>
            <p className="text-xs text-gray-500">QR valid 15 menit</p>
          </div>
        )}
      </div>
    </div>
  );
}