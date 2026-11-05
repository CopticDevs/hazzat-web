import { readerColor, UserSettingsContext } from "../Contexts/UserSettingsContext";
import { useContext } from "react";
import { IInformationContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import VariationTitle from "./VariationTitle";

interface IProps {
    variations: IVariationInfo<IInformationContent>[];
    hymnTitle?: string;
}

function ContentInformation(props: IProps) {
    const { userSettings } = useContext(UserSettingsContext);
    const typography = { '--english-font-size': userSettings.englishFontSize, '--arabic-font-size': userSettings.arabicFontSize,
        '--content-font-color': readerColor(userSettings.contentFontColor), '--hazzat-font-color': readerColor(userSettings.hazzatFontColor) } as React.CSSProperties;

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
                    <div className="information-columns dirLtr" style={typography}>
                        {variation.content.englishInformation ?
                            <div className="information-language" lang="en" style={{ direction: "ltr", textAlign: "left", fontSize: userSettings.englishFontSize, color: readerColor(userSettings.contentFontColor) }} dangerouslySetInnerHTML={{ __html: variation.content.englishInformation }} />
                            : ""}
                        {variation.content.arabicInformation ?
                            <div className="information-language" lang="ar" style={{ direction: "rtl", textAlign: "right", fontSize: userSettings.arabicFontSize, color: readerColor(userSettings.contentFontColor) }} dangerouslySetInnerHTML={{ __html: variation.content.arabicInformation }} />
                            : ""}
                    </div>
                    <CrossDivider />
                </div>
            })}
        </>
    );
}

export default ContentInformation;
