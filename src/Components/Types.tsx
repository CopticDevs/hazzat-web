import { Route, Routes } from "react-router-dom";
import MainPaper, { Size } from "./MainPaper";
import TypeDetails from "./TypeDetails";
import TypesMenu from "./TypesMenu";

function Types() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<TypesMenu />} />
                <Route path={`/:typeId/*`} element={<TypeDetails />} />
            </Routes>
        </MainPaper>
    );
}

export default Types;
