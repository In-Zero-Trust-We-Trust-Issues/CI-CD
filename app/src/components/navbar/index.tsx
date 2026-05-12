import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../theme/use-theme"
import { useAuth } from "../../context/AuthContext"  // ← pakai context, bukan listener sendiri

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { user, profile, signOut } = useAuth()  // ← ambil dari context

  // Hapus semua useEffect auth listener — sudah dihandle AuthContext

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const getThemeText = () => {
    switch (theme) {
      case "light": return "Light"
      case "dark": return "Dark"
      default: return "System"
    }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Staff"

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">HaloTamu</h1>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="text-lg">{getThemeText()}</span>
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-md px-3 py-2"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block font-medium">{displayName}</span>
                <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <button onClick={() => { setIsDropdownOpen(false); navigate("/EditProfile") }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Edit Profile
                    </button>
                    <button onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}