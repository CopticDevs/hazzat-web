import { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppSettings } from "./AppSettings";
import Booklets from "./Components/Booklets";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Home from './Components/Home';
import Seasons from './Components/Seasons';
import Tunes from "./Components/Tunes";
import Types from "./Components/Types";
import "./css/hazzat.css";
import "./fonts/fonts.css";
import { LanguageContext } from "./LanguageContext";
import LocalizedMessage from "./LocalizedMessage";

function App() {
    const { languageProperties } = useContext(LanguageContext);

    return (
        <BrowserRouter>
            <div className={languageProperties.isRtl ? "main dirRtl" : "main"}>
                <div className="mainContainer">
                    <Header navItems={AppSettings.navigationMenuItems} />
                    <div className="body clearfix">
                        <div className="rightleftmain clearfix">
                            <Routes>
                                <Route path="/" element={<Home navItems={AppSettings.navigationMenuItems} />} />
                                <Route path="/Seasons/*" element={<Seasons />} />
                                <Route path="/Types/*" element={<Types />} />
                                <Route path="/Tunes/*" element={<Tunes />} />
                                <Route path="/Booklets/*" element={<Booklets />} />
                                <Route path="*" element={
                                    <main style={{ padding: "1rem" }}>
                                        <p><LocalizedMessage of="noContent" /></p>
                                    </main>} />
                            </Routes>
                        </div>
                    </div>
                    <Footer navItems={AppSettings.navigationMenuItems} />
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
