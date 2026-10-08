import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import JoinSession from "./pages/JoinSession"
import Shop from "./pages/Shop"
import Games from "./pages/Games"
import Profile from "./pages/Profile"
import ActiveSession from "./pages/ActiveSession"
import Settings from "./pages/Settings"

function App() {
  return (
    <BrowserRouter>

    <Routes>

      <Route path="/" element={<JoinSession />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/games" element={<Games />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/session" element={<ActiveSession />} />
      <Route path="/settings" element={<Settings />} />

    </Routes>

    <Navbar />

    </BrowserRouter>
  )
}

export default App