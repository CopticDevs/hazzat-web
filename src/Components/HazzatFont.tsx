import { LanguageContext } from "../LanguageContext";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import hazzatImg from "../images/hazzat.jpg";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import MainPaper, { Size } from "./MainPaper";

function HazzatFont() {

    const { languageProperties } = useContext(LanguageContext);
    useEffect(() => {
        document.title = strings.hazzatFontVer + " - hazzat.com";
    }, [languageProperties.localeName]);

    return (
        <MainPaper size={Size.Wide}>
            <h1 className="pageTitle"><LocalizedMessage of="hazzatFontVer" /></h1>
            <p style={{ paddingTop: "33px" }} dangerouslySetInnerHTML={{ __html: strings.hazzatFontReason } } />
            <blockquote>
                <ul className="BaseFont">
                    <div dangerouslySetInnerHTML={{ __html: strings.hazzatAdvantagesList }} />
                </ul>
            </blockquote>
            <p dangerouslySetInnerHTML={{ __html: strings.hazzatDescSummary }}></p>
            <p style={{ textAlign: "center", paddingTop: "33px" }}>
                <a href={hazzatImg} rel="noopener noreferrer" target="_blank">
                    <img src={hazzatImg} alt={strings.hazzatFont} width="300px" height="217px" /><br />
                    <LocalizedMessage of="enlargePic" />
                </a>
            </p>
            <div style={{ textAlign: "center", paddingTop: "33px" }}>
                <a href="/downloads/Hazzat_v1_10a.zip" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faDownload} className="text-dark" />  <LocalizedMessage of="downloadHazzatFont" />
                </a>
            </div>
        </MainPaper>
    );
}

export default HazzatFont;
