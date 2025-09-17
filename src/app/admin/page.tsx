"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'guru' | 'siswa';
  class: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'siswa' as 'guru' | 'siswa'
  });
  const [showImportForm, setShowImportForm] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user?.role !== 'guru') {
      router.push("/");
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', email: '', password: '', role: 'siswa' });
        setShowCreateForm(false);
        fetchUsers(); // Refresh list
        alert('User berhasil dibuat!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Terjadi kesalahan saat membuat user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers(); // Refresh list
        alert('User berhasil dihapus!');
        setDeleteUserId(null);
        setDeleteUserName('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Terjadi kesalahan saat menghapus user');
    }
  };

  const confirmDelete = (userId: string, userName: string) => {
    setDeleteUserId(userId);
    setDeleteUserName(userName);
  };

  const cancelDelete = () => {
    setDeleteUserId(null);
    setDeleteUserName('');
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/users/export');
      if (response.ok) {
        const csv = await response.text();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-xi2.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Gagal export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Terjadi kesalahan saat export');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setImportLoading(true);
    setImportMessage('');

    try {
      const response = await fetch('/api/users/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportMessage(`Import berhasil: ${data.success} sukses, ${data.errors} error. Password default: password123`);
        if (data.errors > 0) {
          console.error('Import errors:', data.details);
        }
        fetchUsers();
      } else {
        setImportMessage(`Error import: ${data.error}`);
      }
    } catch (error) {
      setImportMessage('Terjadi kesalahan saat import');
      console.error('Import error:', error);
    } finally {
      setImportLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || session.user?.role !== 'guru') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow-sm p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Admin Panel - Kelola User</h1>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              ← Kembali ke Dashboard
            </button>
          </div>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Daftar User</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {showCreateForm ? 'Batal' : '+ Tambah User'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as 'guru' | 'siswa'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Buat User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {showImportForm && (
            <form onSubmit={handleImport} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV File</label>
                <input
                  type="file"
                  name="csvfile"
                  accept=".csv"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format CSV: Name,Email,Role,Class (Role: siswa/guru, Class: XI-2 default). Password default: password123
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={importLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {importLoading ? 'Importing...' : 'Import CSV'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Batal
                </button>
              </div>
              {importMessage && (
                <div className={`mt-4 p-3 rounded-lg ${importMessage.includes('berhasil') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {importMessage}
                </div>
              )}
            </form>
          )}

          {/* Delete Confirmation Dialog */}
          {deleteUserId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus User</h3>
                <p className="text-gray-700 mb-6">
                  Apakah Anda yakin ingin menghapus user <strong>{deleteUserName}</strong>?
                  <br />
                  <span className="text-red-600 text-sm">
                    ⚠️ Semua data absensi user ini juga akan dihapus dan tidak dapat dikembalikan.
                  </span>
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelDelete}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDeleteUser(deleteUserId)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    Hapus User
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Kelas</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-sm text-gray-900">{user.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'guru'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'guru' ? '👨‍🏫 Guru' : '👨‍🎓 Siswa'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{user.class}</td>
                    <td className="px-4 py-2 text-sm">
                      {session?.user?.id !== user._id && (
                        <button
                          onClick={() => confirmDelete(user._id, user.name)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition"
                        >
                          🗑️ Hapus
                        </button>
                      )}
                      {session?.user?.id === user._id && (
                        <span className="text-gray-400 text-xs">Akun Anda</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada user. Klik Tambah User untuk membuat user pertama.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}