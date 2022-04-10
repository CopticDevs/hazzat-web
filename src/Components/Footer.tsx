import { NavLink } from "react-router-dom";

function Footer() {
    return (
        <div className="footer clearfix">
            
            <ul className="sf-menu sf-js-enabled sf-shadow" id="dnn_MENU2">
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
                 <div className="menu-toggle-footer">MENU</div>

            </div>
            
        </div>
    );
}

export default Footer;
