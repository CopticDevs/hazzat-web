import { useState } from "react";
import { NavLink } from "react-router-dom";
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
import "./FormatLink.css";

interface IProps {
    formatId: string;
    fullFormatId?: string;
}

interface IFormatImage {
    mouseOn: string;
    mouseOut: string;
}

function FormatLink(props: IProps) {
    const [hovering, setHovering] = useState(false);

    const getFormatImages = (formatId: string): IFormatImage | undefined => {
        switch (formatId) {
            case "1":
                return {
                    mouseOn: textOn,
                    mouseOut: textOut
                };
            case "2":
                return {
                    mouseOn: hazzatOn,
                    mouseOut: hazzatOut
                };
            case "3":
                return {
                    mouseOn: verticalHazzatOn,
                    mouseOut: verticalHazzatOut
                };
            case "4":
                return {
                    mouseOn: musicOn,
                    mouseOut: musicOut
                };
            case "5":
                return {
                    mouseOn: audioOn,
                    mouseOut: audioOut
                };
            case "6":
                return {
                    mouseOn: videoOn,
                    mouseOut: videoOut
                };
            case "7":
                return {
                    mouseOn: informationOn,
                    mouseOut: informationOut
                };
            default:
                return undefined;
        }
    }

    return (
        <>
            {
                !!props.fullFormatId ?
                    <NavLink to={props.fullFormatId}>
                        <img
                            src={hovering ? getFormatImages(props.formatId)?.mouseOn : getFormatImages(props.formatId)?.mouseOut}
                            alt=""
                            onMouseEnter={() => setHovering(true)}
                            onMouseLeave={() => setHovering(false)}
                        /></NavLink>
                    : <img src={space} alt="" />
            }
        </>
    );
}

export default FormatLink;
