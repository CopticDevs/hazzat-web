import { Route, Routes } from "react-router-dom";
import MainPaper, { Size } from "./MainPaper";
import SeasonRouter from "./SeasonRouter";
import "./SeasonsPage.css";
import SeasonsMenu from "./SeasonsMenu";

function SeasonsPage() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<SeasonsMenu />} />
                <Route path={`/:seasonId/*`} element={<SeasonRouter />} />
            </Routes>
        </MainPaper>
    );
}

export default SeasonsPage;
