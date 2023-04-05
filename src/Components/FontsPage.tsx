import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import saveImg from "../images/save.gif";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import HazzatFont from "./HazzatFont";
import MainPaper, { Size } from "./MainPaper";
import MyNavLink from "./MyNavLink";

function FontsPage() {

    useEffect(() => {
        document.title = strings.fonts + " - hazzat.com";
    }, []);

    return (
        <Routes>
            <Route path="/" element={
                <MainPaper size={Size.Wide}>
                        <div className="pageTitle"><LocalizedMessage of="hazzatFont" /></div>
                        <div><strong><MyNavLink to="HazzatFont"><LocalizedMessage of="hazzatFontVer" /></MyNavLink></strong><br /> <LocalizedMessage of="hazzatFontDesc" /></div>

                        <div className="pageTitle" style={{ paddingTop: "40px" }}><LocalizedMessage of="copticFonts" /></div>
                        <div><LocalizedMessage of="copticZipTitle" /></div>
                        <div style={{ paddingTop: "20px" }} dangerouslySetInnerHTML={{ __html: strings.copticZipContents }}></div>
                        <div style={{ textAlign: "center" }}>
                            <a href="/downloads/copticfonts.zip" rel="noopener noreferrer"><img src={saveImg} alt={strings.save} /> <LocalizedMessage of="downloadAllCopticFonts" /></a>
                        </div>
                    </MainPaper>
            } />
            <Route path={`/HazzatFont`} element={<HazzatFont />} />
        </Routes>
    );
}

export default FontsPage;
