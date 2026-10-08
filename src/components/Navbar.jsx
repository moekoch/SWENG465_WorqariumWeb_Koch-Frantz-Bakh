import { Link } from "react-router-dom"
import "./Navbar.css"

function Navbar(){
    return (
        <nav className="nav">

            <ul className="nav-list">

                <li><Link to="/">Home</Link></li>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/games">Games</Link></li>
                <li><Link to="/profile">Profile</Link></li>

            </ul>
            
        </nav>
    )
}

export default Navbar