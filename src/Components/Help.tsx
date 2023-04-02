import { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import FontInstall7 from "./FontInstall7";
import FontInstallXP from "./FontInstallXP";
import "./Help.css";
import MainPaper, { Size } from "./MainPaper";
import MyNavLink from "./MyNavLink";
import UsingHazzatFont from "./UsingHazzatFont";

function Help() {
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
                        <div><strong><MyNavLink to="HazzatKeyboardMap"><LocalizedMessage of="hazzatKeybdMap" /></MyNavLink></strong></div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="SmallLetters"><LocalizedMessage of="smallLetters" /></MyNavLink></strong>
                        </div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="CapitalLetters"><LocalizedMessage of="capitalLetters" /></MyNavLink></strong>
                        </div>
                        <div className={langClassName}>
                            <strong><MyNavLink to="KeyboardMap"><LocalizedMessage of="keyboardMap" /></MyNavLink></strong>
                        </div>
                    </>
                } />
                <Route path={`/InstallFontWinXP`} element={<FontInstallXP />} />
                <Route path={`/InstallFontWin7`} element={<FontInstall7 />} />
                <Route path={`/UsingHazzatFont`} element={<UsingHazzatFont />} />
            </Routes>
        </MainPaper >
    );
}

export default Help;
