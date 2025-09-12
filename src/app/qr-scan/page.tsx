"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [scannerStarted, setScannerStarted] = useState(false);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "siswa") {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    return () => {
      if (qrReaderRef.current) {
        qrReaderRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    if (qrReaderRef.current) {
      await qrReaderRef.current.stop().catch(console.error);
    }
    const html5QrCode = new Html5Qrcode("reader");
    qrReaderRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScan(decodedText);
        },
        (error) => {
          console.warn(`Scan error: ${error}`);
        }
      );
      setScannerStarted(true);
      setError("");
    } catch (err) {
      setError("Gagal start kamera: " + err);
    }
  };

  const stopScanner = async () => {
    if (qrReaderRef.current) {
      await qrReaderRef.current.stop().catch(console.error);
      setScannerStarted(false);
    }
  };

  const handleScan = async (qrCode: string) => {
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
      if (scannerStarted) {
        stopScanner();
      }
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.role !== "siswa") return <p>Redirecting...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Scan QR Absensi</h1>
        <div id="reader" style={{ width: "100%", height: "300px" }} className="mb-4" />
        {scannerStarted ? (
          <button
            onClick={stopScanner}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded mb-4"
          >
            Stop Kamera
          </button>
        ) : (
          <button
            onClick={startScanner}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded mb-4"
          >
            {loading ? "Loading..." : "Start Kamera Scan"}
          </button>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <p className="text-xs text-gray-500 text-center">Izinkan akses kamera untuk scan QR otomatis</p>
      </div>
    </div>
  );
}