import { useContext, useEffect } from "react";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import MainPaper, { Size } from "./MainPaper";
import saveImg from "../images/save.gif";
import SidePaper from "./SidePaper";
import { LanguageContext } from "../LanguageContext";
import MyNavLink from "./MyNavLink";
import { Route, Routes } from "react-router-dom";
import HazzatFont from "./HazzatFont";

function Fonts() {
    const { languageProperties } = useContext(LanguageContext);

    useEffect(() => {
        document.title = strings.fonts + " - hazzat.com";
    }, []);

    return (
        <Routes>
            <Route path="/" element={

                <div className={languageProperties.isRtl ? "row dirRtl" : "row"} style={languageProperties.isRtl ? { marginRight: "43px" } : {}}>
                    <MainPaper size={Size.Normal}>
                        <div className="pageTitle"><LocalizedMessage of="hazzatFont" /></div>
                        <div><strong><MyNavLink to="HazzatFont"><LocalizedMessage of="hazzatFontVer" /></MyNavLink></strong><br /> <LocalizedMessage of="hazzatFontDesc" /></div>

                        <div className="pageTitle" style={{ paddingTop: "40px" }}><LocalizedMessage of="copticFonts" /></div>
                        <div><LocalizedMessage of="copticZipTitle" /></div>
                        <div style={{ paddingTop: "20px" }} dangerouslySetInnerHTML={{ __html: strings.copticZipContents }}></div>
                        <div style={{ textAlign: "center" }}>
                            <a href="/downloads/copticfonts.zip" rel="noopener noreferrer"><img src={saveImg} alt={strings.save} /> <LocalizedMessage of="downloadAllCopticFonts" /></a>
                        </div>
                    </MainPaper>
                    <SidePaper />
                </div>


            } />
            <Route path={`/HazzatFont`} element={<HazzatFont />} />
        </Routes>
    );
}

export default Fonts;
