import { supabase } from "../lib/supabase"

export interface Guest {
  id: string
  name: string
  company: string
  purpose: string
  arrivalTime: string
  createdAt: string
  ktpUrl?: string | null
}

const BUCKET = "ktp-letters"

const mapGuestData = (row: any): Guest => ({
  id: row.id,
  name: row.name,
  company: row.company,
  purpose: row.purpose,
  arrivalTime: row.arrival_time,
  createdAt: row.created_at,
  ktpUrl: row.ktp_url ?? null,
})
const urlCache: Record<string, { url: string; expiresAt: number }> = {}

async function uploadPdf(file: File): Promise<string | null> {
  const fileName = `${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file)
  if (error) { console.error("Upload error:", error); return null }
  return data.path
}

export const getGuests = async (): Promise<Guest[]> => {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) { console.error(error); return [] }
  return data.map(mapGuestData)
}

export const addGuest = async (
  guestData: Omit<Guest, "id" | "createdAt">,
  pdfFile?: File | null
): Promise<Guest | null> => {
  let ktp_url = guestData.ktpUrl ?? null
  if (pdfFile) ktp_url = await uploadPdf(pdfFile)

  const { data, error } = await supabase
    .from("guests")
    .insert({
      name: guestData.name,
      company: guestData.company,
      purpose: guestData.purpose,
      arrival_time: guestData.arrivalTime,
      ktp_url,
    })
    .select()
    .single()

  if (error) { console.error(error); return null }
  return mapGuestData(data)
}

export const updateGuest = async (
  id: string,
  guestData: Partial<Guest>,
  newPdfFile?: File | null
): Promise<boolean> => {
  let ktp_url = guestData.ktpUrl ?? null

  if (newPdfFile) ktp_url = await uploadPdf(newPdfFile)

  const { error } = await supabase
    .from("guests")
    .update({
      name: guestData.name,
      company: guestData.company,
      purpose: guestData.purpose,
      arrival_time: guestData.arrivalTime,
      ktp_url,
    })
    .eq("id", id)

  if (error) { console.error(error); return false }
  return true
}

export const deleteGuest = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("guests").delete().eq("id", id)
  if (error) { console.error(error); return false }
  return true
}

export const searchGuest = async (keyword: string): Promise<Guest[]> => {
  const kw = `%${keyword}%`
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .or(`name.ilike.${kw},company.ilike.${kw},purpose.ilike.${kw}`)
    .order("created_at", { ascending: false })
  if (error) { console.error(error); return [] }
  return data.map(mapGuestData)
}

export const getSignedUrl = async (path: string): Promise<string | null> => {
  const now = Date.now()
  const cached = urlCache[path]

  if (cached && cached.expiresAt - now > 30_000) {
    return cached.url
  }

  const EXPIRY_SECONDS = 300 // 5 menit
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, EXPIRY_SECONDS)

  if (error) { console.error(error); return null }

  // Simpan ke cache
  urlCache[path] = {
    url: data.signedUrl,
    expiresAt: now + EXPIRY_SECONDS * 1000,
  }

  return data.signedUrl
}
