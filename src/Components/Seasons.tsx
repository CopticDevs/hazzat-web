import { Route, Routes } from "react-router-dom";
import MainPaper, { Size } from "./MainPaper";
import SeasonDetails from "./SeasonDetails";
import "./Seasons.css";
import SeasonsMenu from "./SeasonsMenu";

function Seasons() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<SeasonsMenu />} />
                <Route path={`/:seasonId/*`} element={<SeasonDetails />} />
            </Routes>
        </MainPaper>
    );
}

export default Seasons;
