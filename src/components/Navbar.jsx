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

                <li><Link to="/join-session" className="nav-link">
                    <IoFishOutline size={24} aria-hidden="true" />
                    <span>Home</span>
                </Link></li>

                <li><Link to="/shop" className="nav-link">
                    <IoStorefrontOutline size={24} aria-hidden="true" />
                    <span>Shop</span>
                </Link></li>

                <li><Link to="/games" className="nav-link">
                    <IoDiceOutline size={24} aria-hidden="true" />
                    <span>Games</span>
                </Link></li>

                <li><Link to="/profile" className="nav-link">
                    <IoPersonCircleOutline size={24} aria-hidden="true" />
                    <span>Profile</span>
                </Link></li>

                <li><Link to="/settings" className="nav-link">
                    <GoGear size={24} aria-hidden="true" />
                    <span>Settings</span>
                </Link></li>

            </ul>
            
        </nav>
    )
}

export default Navbar