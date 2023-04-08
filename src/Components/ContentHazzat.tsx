import { useContext, useEffect, useState } from "react";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { LanguageContext } from "../LanguageContext";
import { IHazzatContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    variations: IVariationInfo<IHazzatContent>[];
}

function ContentHazzat(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const { userSettings } = useContext(UserSettingsContext);
    const [overrideEnglishStyle, setOverrideEnglishStyle] = useState<any>({});
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    useEffect(() => {
        const newOverrideEnglishStyle = {
            '--english-font-size': userSettings.englishFontSize,
            '--content-font-color': userSettings.contentFontColor,
            '--hazzat-font-color': userSettings.hazzatFontColor,
            direction: 'ltr',
            textAlign: 'left'
        } as React.CSSProperties & { '--english-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

        setOverrideEnglishStyle(newOverrideEnglishStyle);
    }, [userSettings]);

    const overrideArabicStyle = {
        '--arabic-font-size': userSettings.arabicFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'rtl',
        textAlign: 'right'
    } as React.CSSProperties & { '--arabic-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

    return (
        <>
            {props.variations.map((variation) => {
                return <div key={variation.id}>
                    <div className={langClassName} style={{ paddingBottom: "20px", paddingTop: "20px" }}>
                        <HymnTitle content={variation.name} />
                    </div>
                    <div className="clear" />
                    {variation.content.copticHazzat ?
                        <>
                            <div lang="en" style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: variation.content.copticHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.englishHazzat ?
                        <>
                            <div lang="en" style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: variation.content.englishHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.arabicHazzat ?
                        <>
                            <div lang="ar" style={overrideArabicStyle} dangerouslySetInnerHTML={{ __html: variation.content.arabicHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    
                </div>
            })}
        </>
    );
}

export default ContentHazzat;
