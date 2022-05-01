import { useState } from "react";
import { ArabicLanguageProperties, EnglishLanguageProperties, ILanguageProperties, strings } from "./l8n";
import { LanguageContext } from "./LanguageContext";

interface IProps {
    children?: React.ReactNode;
}

const setDefaultLanguage = (interfaceLanguage: string): ILanguageProperties => {
    switch (interfaceLanguage.toUpperCase().substr(0, 2)) {
        case "AR":
            return ArabicLanguageProperties;
    }

    // fallback:
    return EnglishLanguageProperties;
}

function LanguageProvider(props: IProps) {
    const [languageProperties, setLanguageProperties] = useState<ILanguageProperties>(setDefaultLanguage(strings.getInterfaceLanguage()));

    return (
        <LanguageContext.Provider value={{
            languageProperties,
            setLanguageProperties
        }}>
            {props.children}
        </LanguageContext.Provider>
    )
}

export default LanguageProvider;
