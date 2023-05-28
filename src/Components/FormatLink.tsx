import React, { useContext, useEffect, useState } from "react";
import audioOn from "../images/audio_mouseon.gif";
import audioOut from "../images/audio_mouseout.gif";
import hazzatOn from "../images/hazzat_mouseon.gif";
import hazzatOut from "../images/hazzat_mouseout.gif";
import informationOn from "../images/information_mouseon.gif";
import informationOut from "../images/information_mouseout.gif";
import musicOn from "../images/music_mouseon.gif";
import musicOut from "../images/music_mouseout.gif";
import space from "../images/space.gif";
import textOn from "../images/text_mouseon.gif";
import textOut from "../images/text_mouseout.gif";
import verticalHazzatOn from "../images/verticalhazzat_mouseon.gif";
import verticalHazzatOut from "../images/verticalhazzat_mouseout.gif";
import videoOn from "../images/video_mouseon.gif";
import videoOut from "../images/video_mouseout.gif";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import "./FormatLink.css";
import { DisplayType } from "./FormatOptionLinks";
import MyNavLink from "./MyNavLink";

interface IProps {
    formatId: string;
    title: string;
    fullFormatId?: string;
    display: DisplayType;
    isActive?: boolean;
}

interface IFormatImage {
    mouseOn: string;
    mouseOut: string;
    altString: string;
    cssClass: string;
}

function FormatLink(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [hovering, setHovering] = useState(false);
    const [formatImages, setFormatImages] = useState<IFormatImage | undefined>();
    const langClassName = languageProperties.isRtl ? "paddingLeft" : "paddingRight";

    const getFormatName = (formatId: string): string => {
        switch (formatId) {
            case "1":
                return strings.textFormatName;
            case "2":
                return strings.hazzatFormatName;
            case "3":
                return strings.verticalHazzatFormatName;
            case "4":
                return strings.musicFormatName;
            case "5":
                return strings.audioFormatName;
            case "6":
                return strings.videoFormatName;
            case "7":
                return strings.informationFormatName;
            default:
                return "";
        }
    }

    const getFormatImages = (formatId: string, title: string, lang: string): IFormatImage | undefined => {
        switch (formatId) {
            case "1":
                return {
                    mouseOn: textOn,
                    mouseOut: textOut,
                    altString: `${title} ${strings.textFormatName}`,
                    cssClass: lang === "ar" ? "flipRtl formatImage" : "formatImage"

                };
            case "2":
                return {
                    mouseOn: hazzatOn,
                    mouseOut: hazzatOut,
                    altString: `${title} ${strings.hazzatFormatName}`,
                    cssClass: lang === "ar" ? "flipRtl formatImage" : "formatImage"
                };
            case "3":
                return {
                    mouseOn: verticalHazzatOn,
                    mouseOut: verticalHazzatOut,
                    altString: `${title} ${strings.verticalHazzatFormatName}`,
                    cssClass: lang === "ar" ? "flipRtl formatImage" : "formatImage"
                };
            case "4":
                return {
                    mouseOn: musicOn,
                    mouseOut: musicOut,
                    altString: `${title} ${strings.musicFormatName}`,
                    cssClass: lang === "ar" ? "flipRtl formatImage" : "formatImage"
                };
            case "5":
                return {
                    mouseOn: audioOn,
                    mouseOut: audioOut,
                    altString: `${title} ${strings.audioFormatName}`,
                    cssClass: lang === "ar" ? "flipRtl formatImage" : "formatImage"
                };
            case "6":
                return {
                    mouseOn: videoOn,
                    mouseOut: videoOut,
                    altString: `${title} ${strings.videoFormatName}`,
                    cssClass: lang === "ar" ? "flipRtl formatImage" : "formatImage"
                };
            case "7":
                return {
                    mouseOn: informationOn,
                    mouseOut: informationOut,
                    altString: `${title} ${strings.informationFormatName}`,
                    cssClass: lang === "ar" ? "flipRtl formatImage" : "formatImage"
                };
            default:
                return undefined;
        }
    }

    const setImages = React.useCallback(() => {
        const imageInfo = props.fullFormatId ? getFormatImages(props.formatId, props.title, languageProperties.localeName) : undefined;
        setFormatImages(imageInfo);
    }, [languageProperties, props.fullFormatId, props.formatId, props.title]);

    useEffect(() => {
        setImages();
    }, [setImages]);

    if (!props.fullFormatId) {
        return <></>;
    }

    if (props.isActive) {
        return (
            <>
                <img
                    src={formatImages?.mouseOn}
                    alt={formatImages?.altString}
                    className={formatImages?.cssClass}
                />{props.display === DisplayType.Full ? <span className={langClassName}><strong>{getFormatName(props.formatId)}</strong></span> : null}
            </>
        );
    }

    return (
        <>
            {
                !!props.fullFormatId ?
                    <MyNavLink to={props.fullFormatId}>
                        <img
                            src={hovering ? formatImages?.mouseOn : formatImages?.mouseOut}
                            alt={formatImages?.altString}
                            className={formatImages?.cssClass}
                            onMouseEnter={() => setHovering(true)}
                            onMouseLeave={() => setHovering(false)}
                        />{props.display === DisplayType.Full ? <span className={langClassName}>{getFormatName(props.formatId)}</span> : null}</MyNavLink>
                    : <img src={space} alt="" className="formatImage" />
            }
        </>
    );
}

export default FormatLink;
