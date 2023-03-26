import { Route, Routes } from "react-router-dom";
import BookletDetails from "./BookletDetails";
import BookletsMenu from "./BookletsMenu";
import MainPaper, { Size } from "./MainPaper";

function Booklets() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<BookletsMenu />} />
                <Route path={`/:bookletId/*`} element={<BookletDetails />} />
            </Routes>
        </MainPaper>
    );
}

export default Booklets;
