import { IMusicalNotesContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import MusicXmlScore from "./MusicXmlScore";
import VariationTitle from "./VariationTitle";

interface IProps {
    variations: IVariationInfo<IMusicalNotesContent>[];
    hymnTitle?: string;
}

function ContentMusicalNotes(props: IProps) {

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
                    {variation.content.musicXml ?
                        <>
                            <MusicXmlScore musicXml={variation.content.musicXml} hymnTitle={props.hymnTitle} />
                            <CrossDivider />
                        </> : ""}
                </div>
            })}
        </>
    );
}

export default ContentMusicalNotes;
