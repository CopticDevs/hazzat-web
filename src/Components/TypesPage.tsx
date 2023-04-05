import { Route, Routes } from "react-router-dom";
import MainPaper, { Size } from "./MainPaper";
import TypeRouter from "./TypeRouter";
import TypesMenu from "./TypesMenu";

function TypesPage() {

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={<TypesMenu />} />
                <Route path={`/:typeId/*`} element={<TypeRouter />} />
            </Routes>
        </MainPaper>
    );
}

export default TypesPage;
