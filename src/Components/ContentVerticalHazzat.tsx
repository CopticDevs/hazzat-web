import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { IVariationInfo, IVerticalHazzatContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import HymnTitle from "./HymnTitle";
import crossLine from "../images/crossline.gif";

interface IProps {
    formatId: string;
    variations: IVariationInfo<IVerticalHazzatContent>[];
}

function ContentVerticalHazzat(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

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
                            <div lang="en" style={{ direction: "ltr", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: variation.content.copticVerticalHazzat }} />
                            <div style={{ textAlign: "center" }}>
                                <img src={crossLine} alt="cross" style={{ width: "70%", maxWidth: "508px" }} />
                            </div>
                        </> : ""}
                    {variation.content.englishVerticalHazzat ?
                        <>
                            <div lang="en" style={{ direction: "ltr", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: variation.content.englishVerticalHazzat }} />
                            <div style={{ textAlign: "center" }}>
                                <img src={crossLine} alt="cross" style={{ width: "70%", maxWidth: "508px" }} />
                            </div>
                        </> : ""}
                    {variation.content.arabicVerticalHazzat ?
                        <>
                            <div lang="ar" style={{ direction: "rtl", textAlign: "right" }} dangerouslySetInnerHTML={{ __html: variation.content.arabicVerticalHazzat }} />
                            <div style={{ textAlign: "center" }}>
                                <img src={crossLine} alt="cross" style={{ width: "70%", maxWidth: "508px" }} />
                            </div>
                        </> : ""}
                    
                </div>
            })}
        </>
    );
}

export default ContentVerticalHazzat;
