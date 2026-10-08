import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import JoinSession from "./pages/JoinSession"
import ActiveSession from "./pages/ActiveSession"
import Shop from "./pages/Shop"
import Games from "./pages/Games"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Avatar from "./pages/Avatar"

function App() {
  return (
    <BrowserRouter>

    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/join-session" element={<JoinSession />} />
      <Route path="/active-session" element={<ActiveSession />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/games" element={<Games />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/active-session" element={<ActiveSession />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/avatar" element={<Avatar />} />

    </Routes>

    <Navbar />

    </BrowserRouter>
  )
}

export default App