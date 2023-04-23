import { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import FontInstall7 from "./FontInstall7";
import FontInstallXP from "./FontInstallXP";
import "./HelpPage.css";
import MainPaper, { Size } from "./MainPaper";
import MyNavLink from "./MyNavLink";
import UsingHazzatFont from "./UsingHazzatFont";
import mapImg from "../images/map.jpg";
import mapSmallImg from "../images/small.jpg";
import mapCapsImg from "../images/caps.jpg";
import UsingVerticalHazzatFont from "./UsingVerticalHazzatFont";

function HelpPage() {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "padRight" : "padLeft";

    useEffect(() => {
        document.title = strings.help + " - hazzat.com";
    }, []);

    return (
        <MainPaper size={Size.Wide}>
            <Routes>
                <Route path="/" element={
                    <>
                        <div className="pageTitle"><LocalizedMessage of="hazzatFontHelp" /></div>
                        <div><LocalizedMessage of="insallingFonts" /></div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="InstallFontWinXP"><LocalizedMessage of="instructionsForWinXP" /></MyNavLink></strong>
                        </div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="InstallFontWin7"><LocalizedMessage of="instructionsForWin7" /></MyNavLink></strong>
                        </div>
                        <div><LocalizedMessage of="usingTheFonts" /></div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="UsingHazzatFont"><LocalizedMessage of="usingTheHazzatFont" /></MyNavLink></strong>
                        </div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="UsingVerticalHazzatFont"><LocalizedMessage of="usingTheVerticalHazzatFont" /></MyNavLink></strong>
                        </div>
                        <div><LocalizedMessage of="hazzatKeybdMap" /></div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="SmallLetters"><LocalizedMessage of="smallLetters" /></MyNavLink></strong>
                        </div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="CapitalLetters"><LocalizedMessage of="capitalLetters" /></MyNavLink></strong>
                        </div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="HazzatKeyboardMap"><LocalizedMessage of="keyboardMap" /></MyNavLink></strong>
                        </div>
                    </>
                } />
                <Route path={`/InstallFontWinXP`} element={<FontInstallXP />} />
                <Route path={`/InstallFontWin7`} element={<FontInstall7 />} />
                <Route path={`/UsingHazzatFont`} element={<UsingHazzatFont />} />
                <Route path={`/UsingVerticalHazzatFont`} element={<UsingVerticalHazzatFont />} />
                <Route path={`/SmallLetters`} element={<img src={mapSmallImg} alt={strings.smallLetters} style={{ width: "90%" }} />} />
                <Route path={`/CapitalLetters`} element={<img src={mapCapsImg} alt={strings.capitalLetters} style={{ width: "90%" }} />} />
                <Route path={`/HazzatKeyboardMap`} element={<img src={mapImg} alt={strings.hazzatKeybdMap} style={{ width: "90%" }} />} />
            </Routes>
        </MainPaper >
    );
}

export default HelpPage;
