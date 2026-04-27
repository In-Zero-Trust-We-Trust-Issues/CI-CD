import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, islogin } from "../../utils/auth"; 


const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate("/dashboard");
        }
    }, [navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try{ 
            const success = islogin(formData.username, formData.password);
            if(success) { 
                navigate("/dashboard");
            } else { 
                setError("Username atau Password salah");
            }
        } catch (error) {
            setError("Terjadi kesalahan, silakan coba lagi");
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 ">
        <div>
          <h1 className="mt-6 text-center text-4xl font-bold text-gray-900 dark:text-gray-100">Halo Tamu</h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sebuah Sistem yang berguna sebagai Buku Tamu & Pengunjung Digital
          </p>
        </div>

        <form className="mt-8 space-y-6 " onSubmit={handleSubmit} > 
            <div className="rounded-xl shadow-sm -space-y-px flex flex-col gap-4"> 
                <div > 
                    <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    /> 
                </div> 

                <div> 
                    <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    />
                </div> 
            </div>

            {error && <div className="text-sm text-red-600 dark:text-red-400 ">{error}</div>}

            <div> 
                <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-1 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
            </div>

            <div className="text-center border-[1px] border-gray-600 dark:border-gray-400 p-3 rounded-xl"> 
                <h2 className="text-sm text-gray-600 dark:text-gray-400">Demo Username & Password</h2>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Username: <span className="font-mono">Admin</span>
                    <br/>
                    Password: <span className="font-mono">SelamatDatang123</span>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
