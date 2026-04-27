export interface Guest {
  id: string
  name: string
  company: string
  purpose: string
  arrivalTime: string
  createdAt: string
}

const GUESTS_STORAGE_KEY = "aksa-hr-guests"

export const getGuests = (): Guest[] => {
  if (typeof window === "undefined") return []

  const guestsStr = localStorage.getItem(GUESTS_STORAGE_KEY)
  if (!guestsStr) return []

  try {
    return JSON.parse(guestsStr)
  } catch {
    return []
  }
}

export const saveGuests = (guests: Guest[]): void => {
  localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(guests))
}

export const addGuest = (guestData: Omit<Guest, "id" | "createdAt">): Guest => {
  const guests = getGuests()
  const newGuest: Guest = {
    ...guestData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  guests.unshift(newGuest)
  saveGuests(guests)
  return newGuest
}

export const updateGuest = (id: string, guestData: Partial<Guest>): boolean => {
  const guests = getGuests()
  const index = guests.findIndex((guest) => guest.id === id)

  if (index === -1) return false

  guests[index] = { ...guests[index], ...guestData }
  saveGuests(guests)
  return true
}

export const deleteGuest = (id: string): boolean => {
  const guests = getGuests()
  const filteredGuests = guests.filter((guest) => guest.id !== id)

  if (filteredGuests.length === guests.length) return false

  saveGuests(filteredGuests)
  return true
}

export const searchGuests = (keyword: string): Guest[] => {
  const guests = getGuests()
  if (!keyword.trim()) return guests

  const searchTerm = keyword.toLowerCase()
  return guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm) ||
      guest.company.toLowerCase().includes(searchTerm) ||
      guest.purpose.toLowerCase().includes(searchTerm),
  )
}
