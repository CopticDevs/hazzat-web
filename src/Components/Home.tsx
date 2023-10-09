import { useContext, useEffect } from "react";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";
import "./Home.css";
import MainPaper from "./MainPaper";
import MyNavLink from "./MyNavLink";
import SidePaper from "./SidePaper";

interface IProps {
    navItems: INavMenuItem[];
}

function Home(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);

    useEffect(() => {
        document.title = "hazzat.com";
    }, []);

    return (
        <div className={languageProperties.isRtl ? "row dirRtl" : "row"} style={languageProperties.isRtl ? { marginRight: "43px" } : {}}>
            <MainPaper>
                <div>
                    {
                        props.navItems.map((item) => {
                            if (item.disabled) return null;
                            return (
                                item.id !== "home" ?
                                    <p key={item.id}><MyNavLink to={item.location} className="navLink"><LocalizedMessage of={item.id} /></MyNavLink></p> : null
                            );
                        })
                    }
                </div>
            </MainPaper>

            <SidePaper />
        </div>
    );
}

export default Home;
