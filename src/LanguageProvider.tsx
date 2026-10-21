import React from "react";
import { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArabicLanguageProperties, EnglishLanguageProperties, ILanguageProperties, strings } from "./l8n";
import { LanguageContext } from "./LanguageContext";

interface IProps {
    children?: React.ReactNode;
}

const setDefaultLanguage = (interfaceLanguage: string): ILanguageProperties => {
    switch (interfaceLanguage.toUpperCase().substring(0, 2)) {
        case "AR":
            return ArabicLanguageProperties;
    }

    // fallback:
    return EnglishLanguageProperties;
}

function LanguageProvider(props: IProps) {
    const [languageProperties, setLanguageProperties] = useState<ILanguageProperties>(setDefaultLanguage(strings.getInterfaceLanguage()));

    const { search } = useLocation();
    useLayoutEffect(() => {
        const lang = new URLSearchParams(search).get('lang') || strings.getInterfaceLanguage();
        const appLang = setDefaultLanguage(lang);
        strings.setLanguage(appLang.localeName);
        setLanguageProperties(appLang);
        document.documentElement.lang = appLang.localeName;
        document.documentElement.dir = appLang.isRtl ? "rtl" : "ltr";
    }, [search]);

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
