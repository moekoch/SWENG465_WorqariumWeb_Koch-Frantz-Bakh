import { lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { getToken } from './api.js'
import AppShell from "./components/AppShell"
// login and register load right away, everything inside the shell loads on demand
// (the shell shows the bubble loader while a page loads)
import Login from "./pages/Login"
import Register from "./pages/Register"

// pages in alphabetical order
const Blackjack = lazy(() => import("./pages/Blackjack"))
const BotQuery = lazy(() => import("./pages/BotQuery"))
const Games = lazy(() => import("./pages/Games"))
const GoFish = lazy(() => import("./pages/GoFish"))
const GoFishX = lazy(() => import("./pages/GoFishX"))
const Library = lazy(() => import("./pages/Library"))
const Loading = lazy(() => import("./pages/Loading"))
const Map = lazy(() => import("./pages/Map"))
const Profile = lazy(() => import("./pages/Profile"))
const Settings = lazy(() => import("./pages/Settings"))
const Shop = lazy(() => import("./pages/Shop"))
const Spades = lazy(() => import("./pages/Spades"))
const Tank = lazy(() => import("./pages/Tank"))

// only show the page if the user has a login token
function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* pages without the shell */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* pages inside the shell (header, bubble loader, dock, friends panel) */}
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/map" element={<Map />} />
          <Route path="/tank" element={<Tank />} />
          <Route path="/library" element={<Library />} />
          <Route path="/games" element={<Games />} />
          <Route path="/blackjack" element={<Blackjack />} />
          <Route path="/bot-query" element={<BotQuery />} />
          <Route path="/go-fish" element={<GoFish />} />
          <Route path="/go-fish/challenge" element={<GoFishX />} />
          <Route path="/spades" element={<Spades />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/shop" element={<Shop />} />
        </Route>

        {/* old addresses still work */}
        <Route path="/join-session" element={<Navigate to="/map" replace />} />
        <Route path="/active-session" element={<Navigate to="/map" replace />} />
        <Route path="/avatar" element={<Navigate to="/tank" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
