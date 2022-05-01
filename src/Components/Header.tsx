import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppSettings } from "../AppSettings";
import logo from "../images/logo.png";
import { ILanguageProperties } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";

interface IProps {
    navItems: INavMenuItem[];
}

function Header(props: IProps) {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const { languageProperties, setLanguageProperties } = useContext(LanguageContext);

    const toggleMenu = () => {
        setShowMenu(!showMenu);   
    }

    const handleChangeLanguage = (targetLanguageProperties: ILanguageProperties) => {
        setLanguageProperties && setLanguageProperties(targetLanguageProperties);
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
                        props.navItems.map((item) => {
                            return (
                                <li key={item.id}><NavLink to={item.location}><LocalizedMessage of={item.id} /></NavLink></li>
                            );
                        })
                    }
                    {
                        AppSettings.supportedLanguages.map((langProps) => {
                            return languageProperties.localeName !== langProps.localeName ?
                                <li><NavLink to="#" onClick={() => handleChangeLanguage(langProps)}>{langProps.friendlyName}</NavLink></li> : null
                        })
                    }
                </ul>
            
                <div className="mobile">
                    <div className="menu-toggle" onClick={toggleMenu}><LocalizedMessage of="menu" /></div>
                    {showMenu ? <ul onClick={toggleMenu}>
                        {
                            props.navItems.map((item) => {
                                return (
                                    <li key={item.id}><NavLink to={item.location}><LocalizedMessage of={item.id} /></NavLink></li>
                                );
                            })
                        }
                        {
                            AppSettings.supportedLanguages.map((langProps) => {
                                return languageProperties.localeName !== langProps.localeName ?
                                    <li><NavLink to="#" onClick={() => handleChangeLanguage(langProps)}>{langProps.friendlyName}</NavLink></li> : null
                            })
                        }
                    </ul> : null }
                    
                </div>
            </div>

        </div>
    );
}

export default Header;
