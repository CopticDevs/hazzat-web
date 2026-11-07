import { IAudioContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import VariationTitle from "./VariationTitle";
import SoundCloudPlayer from "./SoundCloudPlayer";
import { soundCloudTrackUrl } from "./SoundCloudUrl";

interface IProps {
    variations: IVariationInfo<IAudioContent>[];
    hymnTitle?: string;
}

function ContentAudio({ variations, hymnTitle }: IProps) {
    const recordings = variations.flatMap(variation => {
        const url = soundCloudTrackUrl(variation.content.audioFilePath || "");
        return url ? [{ variation, url }] : [];
    });

    return (
        <>
            {hymnTitle && (
                <div className="content-heading">
                    <HymnTitle content={hymnTitle} />
                </div>
            )}
            {recordings.map(({ variation, url }) => (
                <div key={variation.id}>
                    {recordings.length > 1 && (
                        <div className="content-heading">
                            <VariationTitle content={variation.displayName} />
                        </div>
                    )}
                    <SoundCloudPlayer url={url} label={variation.displayName || variation.name} />
                    <CrossDivider />
                </div>
            ))}
        </>
    );
}

export default ContentAudio;
