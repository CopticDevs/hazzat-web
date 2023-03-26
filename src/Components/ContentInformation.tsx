import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { IInformationContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    variations: IVariationInfo<IInformationContent>[];
}

function ContentInformation(props: IProps) {
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
                    <div className="d-flex align-items-stretch dirLtr">
                        {variation.content.englishInformation ?
                            <div className={variation.content.arabicInformation ? "flex-grow-1 p-3 contentRBorder" : "flex-grow-1 p-3"} lang="en" style={{ direction: "ltr", textAlign: "left" }} dangerouslySetInnerHTML={{ __html: variation.content.englishInformation }} />
                            : ""}
                        {variation.content.arabicInformation ?
                            <div className={variation.content.englishInformation ? "flex-grow-1 p-3 contentLBorder" : "flex-grow-1 p-3"} lang="ar" style={{ direction: "rtl", textAlign: "right" }} dangerouslySetInnerHTML={{ __html: variation.content.arabicInformation }} />
                            : ""}
                    </div>
                    <CrossDivider />
                </div>
            })}
        </>
    );
}

export default ContentInformation;
