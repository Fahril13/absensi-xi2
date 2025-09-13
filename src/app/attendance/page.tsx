"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import StatusBadge from "@/components/StatusBadge";
import StatsCard from "@/components/StatsCard";
import TrendsChart from "@/components/TrendsChart";
import toast from "react-hot-toast";

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
  const [stats, setStats] = useState<{
    total: number;
    hadir: number;
    alfa: number;
    attendanceRate: string;
  } | null>(null);
  const [trends, setTrends] = useState<any>(null);

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
          setStats(data.stats); // Set stats for teachers
          setTrends(data.trends); // Set trends for teachers
        }

        // Show success notification
        if (!loading) {
          toast.success("Data absensi berhasil dimuat! 📊");
        }
      } else {
        setError("Failed to fetch attendance");
        toast.error("Gagal memuat data absensi ❌");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [session, loading]);

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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {session.user.role === "guru" ? "Daftar Absensi XI-2" : "Riwayat Absensi Saya"}
          </h1>

          {/* Statistics Cards - Only for teachers */}
          {session.user.role === "guru" && stats && (
            <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Total Siswa"
                value={stats.total || 0}
                icon="👥"
                color="border-blue-500"
              />
              <StatsCard
                title="Hadir"
                value={stats.hadir || 0}
                icon="✅"
                color="border-green-500"
              />
              <StatsCard
                title="Tidak Hadir"
                value={stats.alfa || 0}
                icon="❌"
                color="border-red-500"
              />
              <StatsCard
                title="Kehadiran"
                value={`${stats.attendanceRate || 0}%`}
                icon="📊"
                color="border-purple-500"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loading />
            </div>
          ) : attendances.length === 0 ? (
            <p className="text-center text-gray-500">No attendance records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="attendance-table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((att) => (
                    <tr key={att._id}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{att.student.name}</td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{att.student.class}</td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {att.timestamp ? new Date(att.timestamp).toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={att.status} className="status-badge" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Attendance Trends - Only for teachers */}
          {session.user.role === "guru" && trends && (
            <TrendsChart trends={trends} />
          )}
        </div>
      </div>
    </div>
  );
}