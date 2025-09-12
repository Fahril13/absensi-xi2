"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SetupResult {
  message: string;
  admin: {
    name: string;
    email: string;
    password: string;
  };
  instructions: string[];
}

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SetupResult | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Absensi XI2</h1>
          <p className="text-gray-600">Buat akun administrator pertama</p>
        </div>

        {!result && !error && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Yang akan dibuat:</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <div>
                  <strong className="text-blue-900">👨‍🏫 Admin:</strong>
                  <div className="ml-4">admin@xi2.sch.id / admin123</div>
                </div>
                <div>
                  <strong className="text-blue-900">👨‍🎓 Siswa Test:</strong>
                  <div className="ml-4 grid grid-cols-1 gap-1">
                    <div>• Walid: walid@xi2.sch.id / test123</div>
                    <div>• Ciki: ciki@xi2.sch.id / test123</div>
                    <div>• Kevin: kevin@xi2.sch.id / test123</div>
                    <div>• Mutia: mutia@xi2.sch.id / test123</div>
                    <div>• Yasni: yasni@xi2.sch.id / test123</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              {loading ? 'Membuat Admin User...' : 'Buat Admin User'}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">✅ Berhasil!</h3>
              <div className="text-sm text-green-800">
                <p className="mb-2">{result.message}</p>
                <div className="bg-white p-3 rounded border">
                  <p><strong>Email:</strong> {result.admin.email}</p>
                  <p><strong>Password:</strong> {result.admin.password}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">📋 Langkah Selanjutnya:</h3>
              <ol className="text-sm text-yellow-800 space-y-1">
                {result.instructions.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Lanjut ke Login
            </button>
          </div>
        )}

        {error && (
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2">❌ Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}