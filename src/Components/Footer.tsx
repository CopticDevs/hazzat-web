import { useState } from "react";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";
import LanguageSwitcher from "./LanguageSwitcher";
import MyNavLink from "./MyNavLink";

interface IProps {
    navItems: INavMenuItem[];
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
                    props.navItems.map((item) => {
                        return (
                            <li key={item.id}><MyNavLink to={item.location}><LocalizedMessage of={item.id} /></MyNavLink></li>
                        );
                    })
                }
                <LanguageSwitcher />
            </ul>

            <div className="mobile-footer">
                <div className="menu-toggle-footer" onClick={toggleMenu}><LocalizedMessage of="menu" /></div>
                {showMenu ? <ul onClick={toggleMenu}>
                    {
                        props.navItems.map((item) => {
                            return (
                                <li key={item.id}><MyNavLink to={item.location}><LocalizedMessage of={item.id} /></MyNavLink></li>
                            );
                        })
                    }
                    <LanguageSwitcher />
                </ul> : null }
            </div>
            
        </div>
    );
}

export default Footer;
