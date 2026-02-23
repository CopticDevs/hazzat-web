import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { IVariationInfo, IVideoContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import VariationTitle from "./VariationTitle";
import YouTubeVideo from "./YoutubeVideo";

interface IProps {
    variations: IVariationInfo<IVideoContent>[];
    hymnTitle?: string;
}

function ContentVideo(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    return (
        <>
            {props.hymnTitle && (
                <>
                    <div className={langClassName}>
                        <HymnTitle content={props.hymnTitle} />
                    </div>
                    <div className="clear" />
                </>
            )}
            {props.variations.map((variation) => {
                return <div key={variation.id}>
                    {props.variations.length > 1 && (
                        <>
                            <div className={langClassName}>
                                <VariationTitle content={variation.displayName} />
                            </div>
                            <div className="clear" />
                        </>
                    )}
                    {variation.content.copticVideo ?
                        <div>
                            <YouTubeVideo videoId={variation.content.copticVideo} />
                            <CrossDivider />
                        </div> : ""}
                    {variation.content.englishVideo ?
                        <div>
                            <YouTubeVideo videoId={variation.content.englishVideo} />
                            <CrossDivider />
                        </div> : ""}
                    {variation.content.arabicVideo ?
                        <div>
                            <YouTubeVideo videoId={variation.content.arabicVideo} />
                            <CrossDivider />
                        </div> : ""}
                </div>
            })}
        </>
    );
}

export default ContentVideo;
