import { Route, Routes } from "react-router-dom";
import MainPaper, { Size } from "./MainPaper";
import TuneRouter from "./TuneRouter";
import TunesMenu from "./TunesMenu";

function TunesPage() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<TunesMenu />} />
                <Route path={`/:tuneId/*`} element={<TuneRouter />} />
            </Routes>
        </MainPaper>
    );
}

export default TunesPage;
