import InvalidAddressMessage from "./InvalidAddressMessage";
import { Route, Routes } from "react-router-dom";
import BookletDetails from "./BookletDetails";
import BookletsMenu from "./BookletsMenu";
import MainPaper, { Size } from "./MainPaper";

function BookletsPage() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<BookletsMenu />} />
                <Route path={`/:bookletId`} element={<BookletDetails />} />
                <Route path="*" element={<InvalidAddressMessage />} />
            </Routes>
        </MainPaper>
    );
}

export default BookletsPage;
