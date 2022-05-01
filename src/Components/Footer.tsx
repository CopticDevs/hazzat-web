import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";

interface IProps {
    menuItems: INavMenuItem[];
}

function Footer(props: IProps) {
    const [showMenu, setShowMenu] = useState<boolean>(false);
    const { language, setLanguage } = useContext(LanguageContext);

    function toggleMenu() {
        setShowMenu(!showMenu);
    }

    const handleChangeLanguage = (targetLanguage: string) => {
        setLanguage && setLanguage(targetLanguage);
    }

    return (
        <div className="footer clearfix">
            
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

            <div className="mobile-footer">
                <div className="menu-toggle-footer" onClick={toggleMenu}><LocalizedMessage of="menu" /></div>
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
    );
}

export default Footer;
