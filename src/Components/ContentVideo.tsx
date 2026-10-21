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
