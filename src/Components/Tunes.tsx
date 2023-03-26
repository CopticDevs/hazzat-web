import { Route, Routes } from "react-router-dom";
import MainPaper, { Size } from "./MainPaper";
import TuneDetails from "./TuneDetails";
import TunesMenu from "./TunesMenu";

function Tunes() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<TunesMenu />} />
                <Route path={`/:tuneId/*`} element={<TuneDetails />} />
            </Routes>
        </MainPaper>
    );
}

export default Tunes;
