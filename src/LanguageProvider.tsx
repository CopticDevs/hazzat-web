import { useState } from "react";
import { strings } from "./l8n";
import { LanguageContext } from "./LanguageContext";

interface IProps {
    children?: React.ReactNode;
}

const setDefaultLanguage = (interfaceLanguage: string): string => {
    switch (interfaceLanguage.toUpperCase().substr(0, 2)) {
        case "AR":
            return "ar";
    }

    // fallback:
    return "en";
}

function LanguageProvider(props: IProps) {
    const [language, setLanguage] = useState<string>(setDefaultLanguage(strings.getInterfaceLanguage()));

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage
        }}>
            {props.children}
        </LanguageContext.Provider>
    )
}

export default LanguageProvider;
