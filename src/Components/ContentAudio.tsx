import audioImage from "../images/Instrumental.png";
import LocalizedMessage from "../LocalizedMessage";
import { IAudioContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import VariationTitle from "./VariationTitle";

interface IProps {
    variations: IVariationInfo<IAudioContent>[];
    hymnTitle?: string;
}

function ContentAudio(props: IProps) {

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
