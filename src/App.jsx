import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import JoinSession from "./pages/JoinSession"
import Shop from "./pages/Shop"
import Games from "./pages/Games"
import Profile from "./pages/Profile"

function App() {
  return (
    <BrowserRouter>

    <Routes>
      <Route path="/" element={<JoinSession />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/games" element={<Games />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>

    <Navbar />

    </BrowserRouter>
  )
}

export default App