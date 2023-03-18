import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { IHazzatContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    formatId: string;
    variations: IVariationInfo<IHazzatContent>[];
}

function ContentHazzat(props: IProps) {
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
                    {variation.content.copticHazzat ?
                        <>
                            <div lang="en" style={{ direction: "ltr", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: variation.content.copticHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.englishHazzat ?
                        <>
                            <div lang="en" style={{ direction: "ltr", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: variation.content.englishHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    {variation.content.arabicHazzat ?
                        <>
                            <div lang="ar" style={{ direction: "rtl", textAlign: "right" }} dangerouslySetInnerHTML={{ __html: variation.content.arabicHazzat }} />
                            <CrossDivider />
                        </> : ""}
                    
                </div>
            })}
        </>
    );
}

export default ContentHazzat;
