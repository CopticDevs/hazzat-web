import { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppSettings } from "./AppSettings";
import BookletsPage from "./Components/BookletsPage";
import ContactUsPage from "./Components/ContactUsPage";
import FontsPage from "./Components/FontsPage";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import HelpPage from "./Components/HelpPage";
import Home from './Components/Home';
import MainPaper, { Size } from "./Components/MainPaper";
import SeasonsPage from './Components/SeasonsPage';
import TunesPage from "./Components/TunesPage";
import TypesPage from "./Components/TypesPage";
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
                                <Route path="/Seasons/*" element={<SeasonsPage />} />
                                <Route path="/Types/*" element={<TypesPage />} />
                                <Route path="/Tunes/*" element={<TunesPage />} />
                                <Route path="/Booklets/*" element={<BookletsPage />} />
                                <Route path="/Fonts/*" element={<FontsPage />} />
                                <Route path="/Help/*" element={<HelpPage /> } />
                                <Route path="/ContactUs" element={<ContactUsPage />} />
                                <Route path="*" element={
                                    <MainPaper size={Size.Wide}>
                                        <p><LocalizedMessage of="noContent" /></p>
                                    </MainPaper>} />
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
