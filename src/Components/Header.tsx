import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../images/logo.png";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";

interface IProps {
    menuItems: INavMenuItem[];
}

function Header(props: IProps) {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const { language, setLanguage } = useContext(LanguageContext);

    const toggleMenu = () => {
        setShowMenu(!showMenu);   
    }

    const handleChangeLanguage = (targetLanguage: string) => {
        setLanguage && setLanguage(targetLanguage);
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
                                <li key={item.id}><NavLink to={item.location}><LocalizedMessage of={item.id} /></NavLink></li>
                            );
                        })
                    }
                    {
                        language === "en" ?
                            <li><NavLink to="#" onClick={() => handleChangeLanguage("ar")}><LocalizedMessage of="switchLang" /></NavLink></li> :
                            <li><NavLink to="#" onClick={() => handleChangeLanguage("en")}><LocalizedMessage of="switchLang" /></NavLink></li>
                    }
                </ul>
            
                <div className="mobile">
                    <div className="menu-toggle" onClick={toggleMenu}><LocalizedMessage of="menu" /></div>
                    {showMenu ? <ul onClick={toggleMenu}>
                        {
                            props.menuItems.map((item) => {
                                return (
                                    <li key={item.id}><NavLink to={item.location}><LocalizedMessage of={item.id} /></NavLink></li>
                                );
                            })
                        }
                        {
                            language === "en" ?
                                <li><NavLink to="#" onClick={() => handleChangeLanguage("ar")}><LocalizedMessage of="switchLang" /></NavLink></li> :
                                <li><NavLink to="#" onClick={() => handleChangeLanguage("en")}><LocalizedMessage of="switchLang" /></NavLink></li>
                        }
                    </ul> : null }
                    
                </div>
            </div>

        </div>
    );
}

export default Header;
