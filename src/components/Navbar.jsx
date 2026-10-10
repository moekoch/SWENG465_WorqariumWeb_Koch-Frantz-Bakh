import { Link } from "react-router-dom"
import {
  IoFishOutline,
  IoStorefrontOutline,
  IoDiceOutline,
  IoPersonCircleOutline
} from "react-icons/io5"
import { GoGear } from "react-icons/go";
import "./Navbar.css"

function Navbar(){
    return (
        <nav className="nav">

            <ul className="nav-list">

                {/* Home link */}
                <li><Link to="/join-session" className="nav-link">
                    {/* screen readers skip icon */}
                    <IoFishOutline size={24} aria-hidden="true" />
                    <span>Home</span>
                </Link></li>

                {/* Shop link */}
                <li><Link to="/shop" className="nav-link">
                    {/* screen readers skip icon */}
                    <IoStorefrontOutline size={24} aria-hidden="true" />
                    <span>Shop</span>
                </Link></li>

                {/* Games link */}
                <li><Link to="/games" className="nav-link">
                    {/* screen readers skip icon */}
                    <IoDiceOutline size={24} aria-hidden="true" />
                    <span>Games</span>
                </Link></li>

                {/* Profile link */}
                <li><Link to="/profile" className="nav-link">
                    {/* screen readers skip icon */}
                    <IoPersonCircleOutline size={24} aria-hidden="true" />
                    <span>Profile</span>
                </Link></li>

                {/* Settings link */}
                <li><Link to="/settings" className="nav-link">
                    {/* screen readers skip icon */}
                    <GoGear size={24} aria-hidden="true" />
                    <span>Settings</span>
                </Link></li>

            </ul>
            
        </nav>
    )
}

export default Navbar