import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";
import "./Home.css";
import MainPaper from "./MainPaper";
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
                                    <p key={item.id}><NavLink to={item.location} className="navLink"><LocalizedMessage of={item.id} /></NavLink></p> : null
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
