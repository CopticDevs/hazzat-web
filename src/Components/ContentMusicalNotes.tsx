import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
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
                    {variation.content.musicXml ?
                        <>
                            <MusicXmlScore musicXml={variation.content.musicXml} />
                            <CrossDivider />
                        </> : ""}
                </div>
            })}
        </>
    );
}

export default ContentMusicalNotes;
