import { supabase } from "../lib/supabase";

export interface User { 
    username: string;
    fullName: string;
    email?: string; 
}

export const islogin = async (email: string, password: string): Promise<boolean> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) return false
  return true
}

export const isAuthenticated = async (): Promise<boolean> => { 
    const {data} = await supabase.auth.getSession();
    return !!data.session;
}

export const getCurrentUser = async (): Promise<User | null> => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    return { 
        username: data.user.email || "", 
        fullName: data.user.user_metadata.full_name || "",
        email: data.user.email || undefined,    
    }
}

export const updateUserProfile = async (fullname: string): Promise<void> => { 
    await supabase.auth.updateUser({ 
        data: { 
            full_name: fullname 
        } 
    });
}

export const logout = async (): Promise<void> => { 
    await supabase.auth.signOut();
}