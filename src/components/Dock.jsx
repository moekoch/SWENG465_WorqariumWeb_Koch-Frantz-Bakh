import { NavLink } from 'react-router-dom'
import {
  IoMapOutline,
  IoWaterOutline,
  IoLibraryOutline,
  IoGameControllerOutline,
  IoStorefrontOutline,
  IoSettingsOutline,
} from 'react-icons/io5'

// bottom dock: one button per place
const DOCK_ITEMS = [
  { to: '/map', label: 'Map', Icon: IoMapOutline },
  { to: '/tank', label: 'Your Tank', Icon: IoWaterOutline },
  { to: '/library', label: 'Library', Icon: IoLibraryOutline },
  { to: '/games', label: 'Games', Icon: IoGameControllerOutline },
  { to: '/shop', label: 'Store', Icon: IoStorefrontOutline },
  { to: '/settings', label: 'Settings', Icon: IoSettingsOutline },
]

function Dock() {
  return (
    <nav className="dock" aria-label="Places">
      {DOCK_ITEMS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className="dock-link">
          {/* screen readers skip the icon, the label is read instead */}
          <Icon size={22} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default Dock
