import { useEffect } from "react";
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
    useEffect(() => {
        document.title = "hazzat.com";
    }, []);

    return (
        <div className="row">
            <MainPaper>
                <div>
                    {
                        props.navItems.map((item) => {
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
