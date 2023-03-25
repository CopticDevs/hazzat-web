import { Route, Routes } from "react-router-dom";
import MainPaper, { Size } from "./MainPaper";
import "./Seasons.css";
import TypesMenu from "./TypesMenu";

function Types() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<TypesMenu />} />
                {/*<Route path={`/:seasonId/*`} element={<SeasonDetails />} />*/}
            </Routes>
        </MainPaper>
    );
}

export default Types;
