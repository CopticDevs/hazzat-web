import { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppSettings } from "./AppSettings";
import BookletsPage from "./Components/BookletsPage";
import ContactUsPage from "./Components/ContactUsPage";
import FontsPage from "./Components/FontsPage";
import Footer from "./Components/Footer";
import GlobalSearchPage from "./Components/GlobalSearchPage";
import Header from "./Components/Header";
import HelpPage from "./Components/HelpPage";
import Home from './Components/Home';
import InvalidAddressMessage from "./Components/InvalidAddressMessage";
import MainPaper, { Size } from "./Components/MainPaper";
import SeasonsPage from './Components/SeasonsPage';
import "./css/hazzat.css";
import "./fonts/fonts.css";
import { LanguageContext } from "./LanguageContext";

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
                                <Route path="/Search" element={<GlobalSearchPage />} />
                                <Route path="/Types/*" element={<Navigate to="/Seasons" replace />} />
                                <Route path="/Tunes/*" element={<Navigate to="/Seasons" replace />} />
                                <Route path="/Booklets/*" element={<BookletsPage />} />
                                <Route path="/Fonts/*" element={<FontsPage />} />
                                <Route path="/Help/*" element={<HelpPage /> } />
                                <Route path="/ContactUs" element={<ContactUsPage />} />
                                <Route path="*" element={
                                    <MainPaper size={Size.Wide}>
                                        <p><InvalidAddressMessage /></p>
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
