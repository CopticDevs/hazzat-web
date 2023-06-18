import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { ReactComponent as Logo } from "../images/logo.svg";
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
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setShowMenu(!showMenu);   
    }

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    return (
        
        <div className="header clearfix">

            <div className="innerHeader clearfix">

                <div className="logo clearfix">
                    <MyNavLink to="/" aria-label="logo">
                        <Logo title="logo" />
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
            
                <div className="mobile" ref={menuRef}>
                    <div className="menu-toggle" onClick={toggleMenu}>
                        <FontAwesomeIcon
                            icon={faBars}
                            fontSize="22"
                            style={{ paddingRight: "7px", paddingLeft: "7px" }}
                        />
                        <LocalizedMessage of="menu" />
                    </div>
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
