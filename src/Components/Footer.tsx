import { useState } from "react";
import { NavLink } from "react-router-dom";
import { INavMenuItem } from "../Types/INavMenuItem";

interface IProps {
    menuItems: INavMenuItem[];
}

function Footer(props: IProps) {
    const [showMenu, setShowMenu] = useState<boolean>(false);

    function toggleMenu() {
        setShowMenu(!showMenu);
    }

    return (
        <div className="footer clearfix">
            
            <ul className="sf-menu">
                {
                    props.menuItems.map((item) => {
                        return (
                            <li key={item.name}><NavLink to={item.location}>{item.name}</NavLink></li>
                        );
                    })
                }
            </ul>

            <div className="mobile-footer">
                <div className="menu-toggle-footer" onClick={toggleMenu}>MENU</div>
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
    );
}

export default Footer;
