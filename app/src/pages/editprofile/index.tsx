import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { isAuthenticated, getCurrentUser, updateUserProfile } from "../../utils/auth"
import Navbar from "../../components/navbar"
import { useAuth } from "../../context/AuthContext"

export default function ProfilePage() {
  const [lastSignInAt, setLastSignInAt] = useState("")
  const [updatedAt, setUpdatedAt] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()

  useEffect(() => {
    const init = async () => {
      const authed = await isAuthenticated()
      if (!authed) {
        navigate("/")
        return
      }
      const user = await getCurrentUser()
      if (user) {
        setFullName(user.fullName || "")
        setEmail(user.email || "")
        setLastSignInAt(user.last_sign_in_at || "")
        setUpdatedAt(user.updated_at || "")
      }
      setIsChecking(false)
    }
    init()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    try {
      await updateUserProfile(fullName)   // hanya fullName, email tidak diubah via sini
      await refreshProfile()              // refresh context, bukan storage event
      setMessage("Profile berhasil diperbarui!")
      setTimeout(() => {
        navigate(profile?.role === "admin" ? "/dashboard" : "/")
      }, 1500)
    } catch (err) {
      setMessage("Terjadi kesalahan saat memperbarui profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(profile?.role === "admin" ? "/dashboard" : "/")
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? "-" : date.toLocaleString("id-ID")
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Edit Profile
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Perbarui informasi profile Anda.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">

              {/* Baris 1: FullName | Email (readonly) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Masukkan nama lengkap"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                    <span className="ml-1 text-xs text-gray-400">(tidak dapat diubah)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Baris 2: Terakhir Masuk | Terakhir Diperbarui */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lastSignInAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Terakhir Masuk
                  </label>
                  <input
                    type="text"
                    id="lastSignInAt"
                    value={formatDate(lastSignInAt)}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="updatedAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Terakhir Diperbarui
                  </label>
                  <input
                    type="text"
                    id="updatedAt"
                    value={formatDate(updatedAt)}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Pesan sukses/error */}
              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes("berhasil")
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                }`}>
                  {message}
                </div>
              )}

              {/* Tombol */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}