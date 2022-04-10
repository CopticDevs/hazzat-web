import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import MainPaper from "./MainPaper";
import RightPaper from "./RightPaper";

function Home() {
    useEffect(() => {
        document.title = "hazzat.com";
    }, []);

    return (
        <div>
            <MainPaper>
                <div>
                    <p><NavLink to="/Seasons">Seasons</NavLink></p>
                    <p><NavLink to="/Types">Types</NavLink></p>
                    <p><NavLink to="/Tunes">Tunes</NavLink></p>
                </div>
            </MainPaper>

            <RightPaper>
            </RightPaper>
        </div>
    );
}

export default Home;
