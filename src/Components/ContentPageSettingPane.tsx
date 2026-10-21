import { strings } from "../l8n";
import ToTopButton from "./ToTopButton";
import UserSettingsChanger from "./UserSettingsChanger";

export default function ContentPageSettingPane() {
    return <div className="reader-tools" role="group" aria-label={strings.readerTools}>
        <UserSettingsChanger />
        <ToTopButton />
    </div>;
}
