"use client"

import type { Guest } from "../../utils/gueststorage"

interface GuestCardProps {
  guest: Guest
  onEdit: (guest: Guest) => void
  onDelete: (id: string) => void
}

export default function GuestCard({ guest, onEdit, onDelete }: GuestCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{guest.name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{guest.company}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(guest)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(guest.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400 w-20">Keperluan:</span>
          <span className="text-gray-900 dark:text-gray-100">{guest.purpose}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-500 dark:text-gray-400 w-20">Kedatangan:</span>
          <span className="text-gray-900 dark:text-gray-100">{formatDate(guest.arrivalTime)}</span>
        </div>
      </div>
    </div>
  )
}
