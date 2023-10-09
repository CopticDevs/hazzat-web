import { useContext } from "react";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { LanguageContext } from "../LanguageContext";
import { IVariationInfo, IVerticalHazzatContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    variations: IVariationInfo<IVerticalHazzatContent>[];
}

function ContentVerticalHazzat(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const { userSettings } = useContext(UserSettingsContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    const overrideEnglishStyle = {
        '--english-font-size': userSettings.englishFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'ltr',
        textAlign: 'left'
    } as React.CSSProperties & { '--english-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

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
                    {variation.content.copticVerticalHazzat ?
                        <>
                            <div lang="en" style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: variation.content.copticVerticalHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.englishVerticalHazzat ?
                        <>
                            <div lang="en" style={overrideEnglishStyle} dangerouslySetInnerHTML={{ __html: variation.content.englishVerticalHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.arabicVerticalHazzat ?
                        <>
                            <div lang="ar" style={overrideArabicStyle} dangerouslySetInnerHTML={{ __html: variation.content.arabicVerticalHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    
                </div>
            })}
        </>
    );
}

export default ContentVerticalHazzat;
