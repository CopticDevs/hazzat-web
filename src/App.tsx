import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppSettings } from "./AppSettings";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Home from './Components/Home';
import SeasonDetails from './Components/SeasonDetails';
import Seasons from './Components/Seasons';
import Services from './Components/Services';
import "./css/hazzat.css";
import "./fonts/fonts.css";
import LocalizedMessage from "./LocalizedMessage";

function App() {

    return (
        <BrowserRouter>
            <div className="main">
                <div className="mainContainer">
                    <Header menuItems={AppSettings.navigationMenuItems} />
                    <div className="body clearfix">
                        <div className="rightleftmain clearfix">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/Seasons" element={<Seasons />} />
                                <Route path={`/Seasons/:seasonId`} element={<SeasonDetails />} />
                                <Route path={`/Seasons/:seasonId/Services`} element={<Services />} />
                                <Route path="*" element={
                                    <main style={{ padding: "1rem" }}>
                                        <p><LocalizedMessage of="noContent" /></p>
                                    </main>} />
                            </Routes>
                        </div>
                    </div>
                    <Footer menuItems={AppSettings.navigationMenuItems} />
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
