import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

interface SearchFilterProps {
  onSearch: (keyword: string) => void
}

export default function SearchFilter({ onSearch }: SearchFilterProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "")

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const currentKeyword = searchParams.get("keyword") || ""
    setKeyword(currentKeyword)
    onSearch(currentKeyword)
  }, [location.search, onSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(location.search)

    if (keyword.trim()) {
      params.set("keyword", keyword.trim())
    } else {
      params.delete("keyword")
    }

    params.delete("page")

    navigate(`${location.pathname}?${params.toString()}`)
  }

  const handleClear = () => {
    setKeyword("")
    const params = new URLSearchParams(location.search)
    params.delete("keyword")
    params.delete("page")
    navigate(`${location.pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari berdasarkan nama, perusahaan, atau keperluan..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cari
          </button>
          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
