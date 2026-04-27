import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/dashboard";
import LoginPage from "./pages/login";
import EditProfile from "./pages/editprofile";

import ThemeProvider from "./components/theme/themeprovider";

function App() {

  return (
        <ThemeProvider>
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage/>} />
                <Route path="/editprofile" element={<EditProfile />} />
            </Routes>
        </Router>
      </ThemeProvider>
  )
}

export default App