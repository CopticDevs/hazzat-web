import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../images/logo.png";
import { INavMenuItem } from "../Types/INavMenuItem";

interface IProps {
    menuItems: INavMenuItem[];
}

function Header(props: IProps) {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    function toggleMenu() {
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
                <ul className="sf-menu">
                    {
                        props.menuItems.map((item) => {
                            return (
                                <li key={item.name}><NavLink to={item.location}>{item.name}</NavLink></li>
                            );
                        })
                    }
                </ul>
            
                <div className="mobile">
                    <div className="menu-toggle" onClick={toggleMenu}></div>
                    {showMenu ? <ul onClick={toggleMenu}>
                        {
                            props.menuItems.map((item) => {
                                return (
                                    <li key={item.name}><NavLink to={item.location}>{item.name}</NavLink></li>
                                );
                            })
                        }
                    </ul> : null }
                    
                </div>
            </div>

        </div>
    );
}

export default Header;
