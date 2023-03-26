import { useContext } from "react";
import audioImage from "../images/Instrumental.png";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { IAudioContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    variations: IVariationInfo<IAudioContent>[];
}

function ContentAudio(props: IProps) {
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
                    {variation.content.audioFilePath ?
                        <div style={{ textAlign: "center" }}>
                            <a href={variation.content.audioFilePath} target="_blank" rel="noreferrer">
                                <img className="contentImage" src={audioImage} alt={variation.name} /><br />
                                {variation.name}<br />
                                <LocalizedMessage of="audioLinkSuffix" />
                            </a>
                            <CrossDivider />
                        </div> : ""}
                </div>
            })}
        </>
    );
}

export default ContentAudio;
