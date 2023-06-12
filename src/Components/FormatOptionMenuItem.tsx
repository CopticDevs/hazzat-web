import React, { useContext, useEffect, useState } from "react";
import { ReactComponent as AudioOff } from "../images/audio_off.svg";
import { ReactComponent as AudioOn } from "../images/audio_on.svg";
import { ReactComponent as HazzatOff } from "../images/hazzat_off.svg";
import { ReactComponent as HazzatOn } from "../images/hazzat_on.svg";
import { ReactComponent as InfoOff } from "../images/info_off.svg";
import { ReactComponent as InfoOn } from "../images/info_on.svg";
import { ReactComponent as MusicOff } from "../images/music_off.svg";
import { ReactComponent as MusicOn } from "../images/music_on.svg";
import { ReactComponent as TextOff } from "../images/text_off.svg";
import { ReactComponent as TextOn } from "../images/text_on.svg";
import { ReactComponent as VHazzatOff } from "../images/vhazzat_off.svg";
import { ReactComponent as VHazzatOn } from "../images/vhazzat_on.svg";
import { ReactComponent as VideoOff } from "../images/video_off.svg";
import { ReactComponent as VideoOn } from "../images/video_on.svg";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import "./FormatOptionMenuItem.css";

interface IProps {
    formatId: string;
    title: string;
    fullFormatId: string;
    isActive?: boolean;
}

interface IFormatImage {
    mouseOnSvg?: React.SVGProps<SVGSVGElement>;
    mouseOffSvg?: React.SVGProps<SVGSVGElement>;
}

function FormatOptionMenuItem(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [hovering, setHovering] = useState(false);
    const [formatImages, setFormatImages] = useState<IFormatImage | undefined>();
    const langClassName = languageProperties.isRtl ? "paddingLeft" : "paddingRight";
    const alignDirection = languageProperties.isRtl ? "right" : "left";

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
                    mouseOnSvg: <TextOn title={`${title} ${strings.textFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />,
                    mouseOffSvg: <TextOff title={`${title} ${strings.textFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />

                };
            case "2":
                return {
                    mouseOnSvg: <HazzatOn title={`${title} ${strings.hazzatFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />,
                    mouseOffSvg: <HazzatOff title={`${title} ${strings.hazzatFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />
                };
            case "3":
                return {
                    mouseOnSvg: <VHazzatOn title={`${title} ${strings.verticalHazzatFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />,
                    mouseOffSvg: <VHazzatOff title={`${title} ${strings.verticalHazzatFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />
                };
            case "4":
                return {
                    mouseOnSvg: <MusicOn title={`${title} ${strings.musicFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />,
                    mouseOffSvg: <MusicOff title={`${title} ${strings.musicFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />
                };
            case "5":
                return {
                    mouseOnSvg: <AudioOn title={`${title} ${strings.audioFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />,
                    mouseOffSvg: <AudioOff title={`${title} ${strings.audioFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />
                };
            case "6":
                return {
                    mouseOnSvg: <VideoOn title={`${title} ${strings.verticalHazzatFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />,
                    mouseOffSvg: <VideoOff title={`${title} ${strings.verticalHazzatFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />
                };
            case "7":
                return {
                    mouseOnSvg: <InfoOn title={`${title} ${strings.informationFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />,
                    mouseOffSvg: <InfoOff title={`${title} ${strings.informationFormatName}`} className={lang === "ar" ? "flipRtl formatImage" : "formatImage"} />
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

    if (props.isActive) {
        return (
            <div style={{ textAlign: alignDirection }}>
                {formatImages?.mouseOnSvg}
                <span className={langClassName}><strong>{getFormatName(props.formatId)}</strong></span>
            </div>
        );
    }

    return (
        <div
            style={{ textAlign: alignDirection }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}>
            {hovering ? formatImages?.mouseOnSvg : formatImages?.mouseOffSvg}
            <span
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                className={langClassName}>{getFormatName(props.formatId)}</span>
        </div>
    );
}

export default FormatOptionMenuItem;
