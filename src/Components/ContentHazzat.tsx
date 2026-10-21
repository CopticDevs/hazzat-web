import NotationContent from "./NotationContent";
import "./Content.css";
import { useContext } from "react";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { IHazzatContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import VariationTitle from "./VariationTitle";

interface IProps {
    variations: IVariationInfo<IHazzatContent>[];
    hymnTitle?: string;
}

function ContentHazzat(props: IProps) {
    const { userSettings } = useContext(UserSettingsContext);

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
            {props.hymnTitle && (
                <>
                    <div className="content-heading">
                        <HymnTitle content={props.hymnTitle} />
                    </div>
                </>
            )}
            {props.variations.map((variation) => {
                return <div key={variation.id}>
                    {props.variations.length > 1 && (
                        <>
                            <div className="content-heading">
                                <VariationTitle content={variation.displayName} />
                            </div>
                        </>
                    )}
                    {variation.content.copticHazzat ?
                        <>
                            <NotationContent language="en" style={overrideEnglishStyle} content={variation.content.copticHazzat} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.englishHazzat ?
                        <>
                            <NotationContent language="en" style={overrideEnglishStyle} content={variation.content.englishHazzat} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.arabicHazzat ?
                        <>
                            <NotationContent language="ar" style={overrideArabicStyle} content={variation.content.arabicHazzat} />
                            <CrossDivider />
                        </> : ""}
                    
                </div>
            })}
        </>
    );
}

export default ContentHazzat;
