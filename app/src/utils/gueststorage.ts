import { supabase } from "../lib/supabase"

export interface Guest {
  id: string
  name: string
  company: string
  purpose: string
  arrivalTime: string
  createdAt: string
}

const mapGuestData = (row: any): Guest => ({
  id: row.id,
  name: row.name,
  company: row.company,
  purpose: row.purpose,
  arrivalTime: row.arrival_time,
  createdAt: row.created_at,
})

export const getGuests = async (): Promise<Guest[]> => {
  const {data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching guests:', error)
    return []
  }
  
  return data.map(mapGuestData)
}

export const addGuest = async (guestData: Omit<Guest, 'id' | 'createdAt'>): Promise<Guest | null> => {
  const {data: UserData} = await supabase.auth.getUser()
  if(!UserData.user){ 
    return null
  }
  const { data, error } = await supabase.from('guests').insert({
    name: guestData.name,
    company: guestData.company,
    purpose: guestData.purpose,
    arrival_time: guestData.arrivalTime,
    user_id: UserData.user.id, 
  })
  .select()
  .single()

  if (error) {
    console.error('Error adding guest:', error)
    return null
  }

  return mapGuestData(data)
}

export const updateGuest = async (id: string, guestData: Partial<Guest>): Promise<boolean> => { 
  const {error } = await supabase.from('guests').update({
    name: guestData.name,
    company: guestData.company,
    purpose: guestData.purpose,
    arrival_time: guestData.arrivalTime,
  }).eq('id', id)

  if (error) {
    console.error('Error updating guest:', error)
    return false
  }
  
  return true
}

export const deleteGuest = async (id: string): Promise<boolean> => { 
  const {error} = await supabase
  .from('guests')
  .delete()
  .eq('id', id)

  if (error) {
    console.error('Error deleting guest:', error)
    return false
  }
  return true
}

export const searchGuest = async (keyword: string): Promise<Guest[]> => { 
  const {data, error} = await supabase
  .from('guests')
  .select('*')
  .or(`name.ilike.%${keyword}%,company.ilike.%${keyword}%,purpose.ilike.%${keyword}%`)
  .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error searching guests:', error)
    return []
  }
  return data.map(mapGuestData)
}