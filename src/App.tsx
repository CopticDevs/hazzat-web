import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Home from './Components/Home';
import SeasonDetails from './Components/SeasonDetails';
import Seasons from './Components/Seasons';
import Services from './Components/Services';

function App() {
    return (
        <BrowserRouter>
            <Header />
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
            <Footer />
        </BrowserRouter>
    );
}

export default App;
