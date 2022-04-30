import { useState } from "react";
import { NavLink } from "react-router-dom";

function Footer() {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    function toggleMenu() {
        setShowMenu(!showMenu);
    }

    return (
        <div className="footer clearfix">
            
            <ul className="sf-menu">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/Seasons">Seasons</NavLink></li>
                <li><NavLink to="/Types">Types</NavLink></li>
                <li><NavLink to="/Tunes">Tunes</NavLink></li>
                <li><NavLink to="/Booklets">Booklets</NavLink></li>
                <li><NavLink to="/Fonts">Fonts</NavLink></li>
                <li><NavLink to="/Help">Help</NavLink></li>
                <li><NavLink to="/ContactUs">Contact Us</NavLink></li>
            </ul>

            <div className="mobile-footer">
                <div className="menu-toggle-footer" onClick={toggleMenu}>MENU</div>
                {showMenu ? <ul onClick={toggleMenu}>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/Seasons">Seasons</NavLink></li>
                    <li><NavLink to="/Types">Types</NavLink></li>
                    <li><NavLink to="/Tunes">Tunes</NavLink></li>
                    <li><NavLink to="/Booklets">Booklets</NavLink></li>
                    <li><NavLink to="/Fonts">Fonts</NavLink></li>
                    <li><NavLink to="/Help">Help</NavLink></li>
                    <li><NavLink to="/ContactUs">Contact Us</NavLink></li>
                </ul> : null }
            </div>
            
        </div>
    );
}

export default Footer;
