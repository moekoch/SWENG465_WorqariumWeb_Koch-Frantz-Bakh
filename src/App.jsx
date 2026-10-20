import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"

// pages in alphabetical order
import ActiveSession from "./pages/ActiveSession"
import Avatar from "./pages/Avatar"
import Blackjack from "./pages/Blackjack"
import BotQuery from "./pages/BotQuery"
import Games from "./pages/Games"
import GoFish from "./pages/GoFish"
import JoinSession from "./pages/JoinSession"
import Loading from "./pages/Loading"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Register from "./pages/Register"
import Settings from "./pages/Settings"
import Shop from "./pages/Shop"

// wraps every screen that should show the navbar
function LayoutWithNavbar() {
  return (
    <>
      <Outlet />
      <Navbar />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>

    <Routes>
      {/* pages without navbar */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* pages with navbar */}
      <Route element={<LayoutWithNavbar />}>
        <Route path="/active-session" element={<ActiveSession />} />
        <Route path="/avatar" element={<Avatar />} />
        <Route path="/blackjack" element={<Blackjack />} />
        <Route path="/bot-query" element={<BotQuery />} />
        <Route path="/games" element={<Games />} />
        <Route path="/go-fish" element={<GoFish />} />
        <Route path="/join-session" element={<JoinSession />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/shop" element={<Shop />} />
      </Route>

    </Routes>

    </BrowserRouter>
  )
}

export default App