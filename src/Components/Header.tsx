import { useContext, useState } from "react";
import logo from "../images/logo.png";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";
import LanguageSwitcher from "./LanguageSwitcher";
import MyNavLink from "./MyNavLink";

interface IProps {
    navItems: INavMenuItem[];
}

function Header(props: IProps) {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const { languageProperties } = useContext(LanguageContext);

    const toggleMenu = () => {
        setShowMenu(!showMenu);   
    }

    return (
        
        <div className="header clearfix">

            <div className="innerHeader clearfix">

                <div className="logo clearfix">
                    <MyNavLink to="/" aria-label="logo">
                        <img src={logo} alt="logo" />
                    </MyNavLink>
                </div>

            </div>

            <div className={languageProperties.isRtl ? "nav navRtl clearfix": "nav clearfix" }>
                <ul className="sf-menu">
                    {
                        props.navItems.map((item) => {
                            if (item.disabled) return null;
                            return (
                                <li key={item.id}><MyNavLink to={item.location}><LocalizedMessage of={item.id} /></MyNavLink></li>
                            );
                        })
                    }
                    <LanguageSwitcher />
                </ul>
            
                <div className="mobile">
                    <div className="menu-toggle" onClick={toggleMenu}><LocalizedMessage of="menu" /></div>
                    {showMenu ? <ul onClick={toggleMenu}>
                        {
                            props.navItems.map((item) => {
                                if (item.disabled) return null;
                                return (
                                    <li key={item.id}><MyNavLink to={item.location}><LocalizedMessage of={item.id} /></MyNavLink></li>
                                );
                            })
                        }
                        <LanguageSwitcher />
                    </ul> : null }
                    
                </div>
            </div>

        </div>
    );
}

export default Header;
