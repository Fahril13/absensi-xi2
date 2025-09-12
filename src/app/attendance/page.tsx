"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  _id: string;
  student: {
    name: string;
    email: string;
    class: string;
  };
  date: string;
  status: string;
  timestamp: string;
  location?: string;
}

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAttendances = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch("/api/attendance", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        const attendanceData = data.attendance;
        // Filter based on role: admin sees all, student sees own
        if (session.user.role === "siswa") {
          const userAttendances = attendanceData.filter((att: AttendanceRecord) => att.student.email === session.user.email);
          setAttendances(userAttendances);
        } else {
          setAttendances(attendanceData);
        }
      } else {
        setError("Failed to fetch attendance");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    fetchAttendances();
  }, [session, status, router, fetchAttendances]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Redirecting...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          {session.user.role === "guru" ? "Daftar Absensi" : "Riwayat Absensi Saya"}
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center">Loading attendance...</p>
        ) : attendances.length === 0 ? (
          <p className="text-center text-gray-500">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((att) => (
                  <tr key={att._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{att.student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{att.student.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.timestamp ? new Date(att.timestamp).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {att.status === 'hadir' ? 'Hadir' :
                       att.status === 'izin' ? 'Izin' :
                       att.status === 'sakit' ? 'Sakit' : 'Tidak Hadir'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}