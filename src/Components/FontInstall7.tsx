import { useEffect } from "react";
import win7_1Img from "../images/win7-1.png";
import win7_2Img from "../images/win7-2.png";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import BreadCrumb from "./BreadCrumb";
import MyNavLink from "./MyNavLink";

function FontInstall() {

    useEffect(() => {
        document.title = strings.instructionsForWin7 + " - hazzat.com";
    }, []);

    return (
        <>
            <div className="pageTitle"><LocalizedMessage of="instructionsForWin7" /></div>
            <BreadCrumb items={[
                { title: strings.help, path: "/Help" },
                { title: strings.instructionsForWin7 }]} />
            <p><LocalizedMessage of="downloadAndSaveZip" /></p>
            <p><img src={win7_1Img} alt={strings.downloadAndSaveZip} /></p>
            <p><LocalizedMessage of="extractZip" /></p>
            <p><LocalizedMessage of="browseAndSelect" /></p>
            <p><LocalizedMessage of="clickAndInstall" /></p>
            <p><img src={win7_2Img} alt={strings.clickAndInstall} /></p>
            <div style={{ textAlign: "center", paddingTop: "30px", paddingBottom: "30px" }}>
                <MyNavLink to="#" onClick={() => window.history.back()}>
                    <LocalizedMessage of="goBack" />
                </MyNavLink>
            </div>
        </>
    );
}

export default FontInstall;
