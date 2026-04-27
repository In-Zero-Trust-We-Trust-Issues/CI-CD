import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { isAuthenticated } from "../../utils/auth"
import { getGuests, addGuest, updateGuest, deleteGuest, searchGuests, type Guest } from "../../utils/gueststorage"
import Navbar from "../../components/navbar"
import SearchFilter from "../../components/seacrh/searchfilter"
import GuestCard from "../../components/card/guestcard"
import GuestModal from "../../components/modal/usermodal"
import Pagination from "../../components/pagination/pagination"

const ITEMS_PER_PAGE = 6

export default function Dashboard() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedGuests, setPaginatedGuests] = useState<Guest[]>([])

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/")
      return
    }

    loadGuests()
  }, [navigate])

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const page = Number.parseInt(searchParams.get("page") || "1")
    setCurrentPage(page)
  }, [location.search])

  useEffect(() => {
    const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE)
    setTotalPages(totalPages)

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setPaginatedGuests(filteredGuests.slice(startIndex, endIndex))
  }, [filteredGuests, currentPage])

  const loadGuests = () => {
    const allGuests = getGuests()
    setGuests(allGuests)
    setFilteredGuests(allGuests)
  }

  const handleSearch = useCallback(
    (keyword: string) => {
      if (keyword.trim()) {
        const results = searchGuests(keyword)
        setFilteredGuests(results)
      } else {
        setFilteredGuests(guests)
      }
      setCurrentPage(1)
    },
    [guests],
  )

  const handleAddGuest = () => {
    setEditingGuest(null)
    setIsModalOpen(true)
  }

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest)
    setIsModalOpen(true)
  }

  const handleSaveGuest = (guestData: Omit<Guest, "id" | "createdAt">) => {
    if (editingGuest) {
      updateGuest(editingGuest.id, guestData)
    } else {
      addGuest(guestData)
    }
    loadGuests()
    setIsModalOpen(false)
    setEditingGuest(null)
  }

  const handleDeleteGuest = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data tamu ini?")) {
      deleteGuest(id)
      loadGuests()
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Nama", "Perusahaan", "Keperluan", "Waktu Kedatangan", "Waktu Input"],
      ...filteredGuests.map((guest) => [
        guest.name,
        guest.company,
        guest.purpose,
        new Date(guest.arrivalTime).toLocaleString("id-ID"),
        new Date(guest.createdAt).toLocaleString("id-ID"),
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `data-tamu-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Tamu</h1>
              <p className="text-gray-600 dark:text-gray-400">Kelola data pengunjung dan tamu </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={handleAddGuest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Tambah Tamu
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Tamu</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{guests.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Hari Ini</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {
                        guests.filter(
                          (guest) => new Date(guest.arrivalTime).toDateString() === new Date().toDateString(),
                        ).length
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Hasil Pencarian</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{filteredGuests.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SearchFilter onSearch={handleSearch} />

        {paginatedGuests.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedGuests.map((guest) => (
                <GuestCard key={guest.id} guest={guest} onEdit={handleEditGuest} onDelete={handleDeleteGuest} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredGuests.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Tidak ada data tamu</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {new URLSearchParams(location.search).get("keyword") ? "Tidak ditemukan hasil pencarian." : "Mulai dengan menambahkan tamu baru."}
            </p>
          </div>
        )}
      </div>

      <GuestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingGuest(null)
        }}
        onSave={handleSaveGuest}
        guest={editingGuest}
      />
    </div>
  )
}
