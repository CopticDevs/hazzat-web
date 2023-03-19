import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { IVariationInfo, IVideoContent } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import YouTubeVideo from "./YoutubeVideo";

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
