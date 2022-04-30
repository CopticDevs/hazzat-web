import { NavLink } from "react-router-dom";
import logo from "../images/logo.png";
import { useState } from "react";

function Header() {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    function handleOnClick() {
        setShowMenu(!showMenu);   
    }

    return (
        
        <div className="header clearfix">

            <div className="innerHeader clearfix">

                <div className="logo clearfix">
                    <NavLink to="/">
                        <img src={logo} alt="" />
                    </NavLink>
                </div>

            </div>

            <div className="nav clearfix">
                <ul className="sf-menu sf-js-enabled sf-shadow">
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/Seasons">Seasons</NavLink></li>
                    <li><NavLink to="/Types">Types</NavLink></li>
                    <li><NavLink to="/Tunes">Tunes</NavLink></li>
                    <li><NavLink to="/Booklets">Booklets</NavLink></li>
                    <li><NavLink to="/Fonts">Fonts</NavLink></li>
                    <li><NavLink to="/Help">Help</NavLink></li>
                    <li><NavLink to="/ContactUs">Contact Us</NavLink></li>
                </ul>
            
                <div className="mobile">
                    <div className="menu-toggle" onClick={handleOnClick}></div>
                    {showMenu ? <ul onClick={handleOnClick}>
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

        </div>
    );
}

export default Header;
