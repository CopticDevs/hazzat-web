import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import LocalizedMessage from "../LocalizedMessage";
import { INavMenuItem } from "../Types/INavMenuItem";
import MainPaper from "./MainPaper";
import SidePaper from "./RightPaper";

interface IProps {
    navItems: INavMenuItem[];
}

function Home(props: IProps) {
    useEffect(() => {
        document.title = "hazzat.com";
    }, []);

    return (
        <div>
            <MainPaper>
                <div>
                    {
                        props.navItems.map((item) => {
                            return (
                                item.id !== "home" ?
                                <p key={item.id}><NavLink to={item.location}><LocalizedMessage of={item.id} /></NavLink></p> : null
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
