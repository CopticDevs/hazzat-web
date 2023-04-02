import { useEffect } from "react";
import winxp1Img from "../images/winxp1.jpg";
import winxp2Img from "../images/winxp2.jpg";
import winxp3Img from "../images/winxp3.jpg";
import winxp4Img from "../images/winxp4.jpg";
import winxp5Img from "../images/winxp5.jpg";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import BreadCrumb from "./BreadCrumb";
import MyNavLink from "./MyNavLink";

function FontInstallXP() {

    useEffect(() => {
        document.title = strings.instructionsForWinXP + " - hazzat.com";
    }, []);

    return (
        <>
            <div className="pageTitle"><LocalizedMessage of="instructionsForWinXP" /></div>
            <BreadCrumb items={[
                { title: strings.help, path: "/Help" },
                { title: strings.instructionsForWinXP }]} />
            <p><LocalizedMessage of="downloadAndSaveZip" /></p>
            <p><img src={winxp1Img} alt={strings.downloadAndSaveZip} /></p>
            <p><LocalizedMessage of="extractZip" /></p>
            <p><LocalizedMessage of="ctrPanelFonts" /></p>
            <p><img src={winxp2Img} alt={strings.ctrPanelFonts} /><img src={winxp3Img} alt={strings.fonts} /></p>
            <p><LocalizedMessage of="fileInstallFont" /></p>
            <p><img src={winxp4Img} alt={strings.fileInstallFont} /></p>
            <p><LocalizedMessage of="browseAndOK" /></p>
            <p><img src={winxp5Img} alt={strings.browseAndOK} /></p>
            <div style={{ textAlign: "center", paddingTop: "30px", paddingBottom: "30px" }}>
                <MyNavLink to="#" onClick={() => window.history.back()}>
                    <LocalizedMessage of="goBack" />
                </MyNavLink>
            </div>
        </>
    );
}

export default FontInstallXP;
