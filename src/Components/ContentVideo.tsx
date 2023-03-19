import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { IVariationInfo, IVideoContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    formatId: string;
    variations: IVariationInfo<IVideoContent>[];
}

function ContentVideo(props: IProps) {
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
                    {variation.content.copticVideo ?
                        <div>
                            <div style={{ position: "relative", width: "100%", height: "0", paddingBottom: "56.25%" }} >
                                <iframe title={`${variation.name} Coptic`} style={{ position: "absolute", width: "100%", height: "100%", left: 0, top: 0 }} src={`http://www.youtube.com/embed/${variation.content.copticVideo}`} frameBorder="0" allowFullScreen />
                            </div>
                            <CrossDivider />
                        </div> : ""}
                    {variation.content.englishVideo ?
                        <div>
                            <div style={{ position: "relative", width: "100%", height: "0", paddingBottom: "56.25%" }} >
                                <iframe title={`${variation.name} English`} style={{ position: "absolute", width: "100%", height: "100%", left: 0, top: 0 }} src={`http://www.youtube.com/embed/${variation.content.englishVideo}`} frameBorder="0" allowFullScreen />
                            </div>
                            <CrossDivider />
                        </div> : ""}
                    {variation.content.arabicVideo ?
                        <div>
                            <div style={{ position: "relative", width: "100%", height: "0", paddingBottom: "56.25%" }} >
                                <iframe title={`${variation.name} Arabic`} style={{ position: "absolute", width: "100%", height: "100%", left: 0, top: 0 }} src={`http://www.youtube.com/embed/${variation.content.arabicVideo}`} frameBorder="0" allowFullScreen />
                            </div>
                            <CrossDivider />
                        </div> : ""}
                </div>
            })}
        </>
    );
}

export default ContentVideo;
