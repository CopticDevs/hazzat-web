import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter, Route, Routes
} from "react-router-dom";
import Home from './Components/Home';
import './index.css';
import reportWebVitals from './reportWebVitals';
import SeasonDetails from './Components/SeasonDetails';
import Seasons from './Components/Seasons';
import Services from './Components/Services';
import Page from './Components/Page';

ReactDOM.render(
    <React.StrictMode>
        <Page>
            <BrowserRouter>
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
            </BrowserRouter>
        </Page>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
