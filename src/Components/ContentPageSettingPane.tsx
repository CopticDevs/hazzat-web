import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import ToTopButton from "./ToTopButton";
import UserSettingsChanger from "./UserSettingsChanger";

function ContentPageSettingPane() {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "position-fixed start-0" : "position-fixed end-0";

    return (
        <div className={langClassName} style={{ zIndex: 100, top: '20%', width: "45px" }}>
            <UserSettingsChanger />
            <ToTopButton />
        </div>
    );
    
}

export default ContentPageSettingPane;
