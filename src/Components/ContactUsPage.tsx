import { useContext, useEffect } from "react";
import { LanguageContext } from "../LanguageContext";
import { strings } from "../l8n";
import MainPaper, { Size } from "./MainPaper";
export default function ContactUsPage() {
    const { languageProperties } = useContext(LanguageContext);
    useEffect(() => { document.title = `${strings.contactUs} - hazzat.com`; }, [languageProperties.localeName]);
    return <MainPaper size={Size.Wide}><h1 className="pageTitle">{strings.contactUs}</h1>
        <p role="status">{strings.contactUnavailable}</p>
    </MainPaper>;
}
