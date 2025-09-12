"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AbsenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAbsen = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      // First, sign in the user
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: `/absen/${token}?absen=true`,
      });

      if (signInResult?.ok) {
        // If sign in successful, call the scan API
        const response = await fetch("/api/qr/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData: token, userId: email }), // Use email as userId or adjust
        });
        const data = await response.json();
        if (response.ok) {
          setMessage(data.message || "Absensi berhasil!");
          // Redirect to attendance page after success
          setTimeout(() => {
            router.push('/attendance');
          }, 2000); // Delay to show message
        } else {
          setError(data.error || "Absensi gagal");
        }
      } else {
        setError(signInResult?.error || "Login gagal");
      }
    } catch (err) {
      setError("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Absensi QR</h1>
        <p className="text-center text-sm text-gray-600 mb-4">Login untuk absen</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4"
        />
        <button
          onClick={handleAbsen}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded mb-4"
        >
          {loading ? "Processing..." : "Absen dan Login"}
        </button>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <p className="text-xs text-gray-500 text-center">Token: {token}</p>
      </div>
    </div>
  );
}