import { useContext } from "react";
import { AppSettings } from "../AppSettings";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { IMusicalNotesContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";
import musicImg from "../images/Music.png";
import instrumentalImg from "../images/Instrumental.png";
import "./ContentMusicalNotes.css";

interface IProps {
    formatId: string;
    variations: IVariationInfo<IMusicalNotesContent>[];
}

function ContentMusicalNotes(props: IProps) {
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
                    {variation.content.musicFilePath ?
                        <div style={{ textAlign: "center" }}>
                            <a href={variation.content.musicFilePath} target="_blank" rel="noreferrer">
                                <img className="contentImage" src={musicImg} alt={variation.name} /><br />
                                {variation.name}<br />
                                <LocalizedMessage of="musicalNotesLinkSuffix" />
                            </a>
                            <CrossDivider />
                        </div> : ""}
                    {AppSettings.showMusicAudio && variation.content.audioFilePath ?
                        <div style={{ textAlign: "center" }}>
                            <a href={variation.content.audioFilePath} target="_blank" rel="noreferrer">
                                <img className="contentImage" src={instrumentalImg} alt={variation.name} /><br />
                                {variation.name}<br />
                                <LocalizedMessage of="musicAudioLinkSuffix" />
                            </a>
                            <CrossDivider />
                        </div> : ""}
                </div>
            })}
        </>
    );
}

export default ContentMusicalNotes;
