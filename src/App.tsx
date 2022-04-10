import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Home from './Components/Home';
import SeasonDetails from './Components/SeasonDetails';
import Seasons from './Components/Seasons';
import Services from './Components/Services';
import "./App.css";
import "./fonts/fonts.css";
import "./css/hazzat.css";

function App() {
    return (
        <BrowserRouter>
            <div className="main">
                <div className="mainContainer">
                    <Header />
                    <div className="body clearfix">
                        <div className="rightleftmain clearfix">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/Seasons" element={<Seasons />} />
                                <Route path={`/Seasons/:seasonId`} element={<SeasonDetails />} />
                                <Route path={`/Seasons/:seasonId/Services`} element={<Services />} />
                                <Route path="*" element={
                                    <main style={{ padding: "1rem" }}>
                                        <p>There's nothing here!</p>
                                    </main>} />
                            </Routes>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
