export interface User { 
    username: string;
    fullName: string;
}

export const AUTH_STORAGE_KEY = "halo-tamu-auth"; 
export const USER_PROFILE_KEY = "halo-tamu-user-profile"; 

const VALID_CREDENTIALS= { 
    username: "Admin",
    password: "SelamatDatang123"
}

export const getCurrentUser = (): User | null => { 
    if (typeof window === "undefined") return null

    const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!userStr) return null;

    try{ 
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export const getUserProfile = () => { 
    if(typeof window !=="undefined") return null


    const profileStr = localStorage.getItem(USER_PROFILE_KEY);
    if(!profileStr) return {fullName: "Admin"}
}


export const UpdateUserProfile = (fullName: string): void => {
    const profile = {fullName}; 
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));


    const currentUser = getCurrentUser(); 
    if(currentUser){ 
        currentUser.fullName = fullName;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    }

}

export const isAuthenticated = (): boolean => {
    return getCurrentUser() !== null;
}


export const islogin = (username:string, password:string): boolean => {
    if(username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password){ 
        const user: User = { 
            username,
            fullName: getUserProfile()?.fullName || "Admin"
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return true;
    }
    return false;
}

export const logout = ():void => { 
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

