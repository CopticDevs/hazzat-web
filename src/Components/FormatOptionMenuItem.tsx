import { useContext } from "react";
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
import { LanguageContext } from "../LanguageContext";
import { formatDisplayName } from "../Providers/HymnsDataProvider/FormatNames";
import "./FormatOptionMenuItem.css";

const icons = [[TextOff, TextOn], [HazzatOff, HazzatOn], [VHazzatOff, VHazzatOn], [MusicOff, MusicOn], [AudioOff, AudioOn], [VideoOff, VideoOn], [InfoOff, InfoOn]];
interface Props { formatId: string; title: string; fullFormatId: string; isActive?: boolean }
export default function FormatOptionMenuItem({ formatId, isActive }: Props) {
    const { languageProperties } = useContext(LanguageContext);
    const [Off, On] = icons[Number(formatId) - 1];
    const flip = languageProperties.isRtl ? " flipRtl" : "";
    const name = formatDisplayName(formatId, languageProperties.localeName);
    return <span className="format-option">
        <Off aria-hidden="true" focusable="false" className={`format-icon-off${flip}`} />
        <On aria-hidden="true" focusable="false" className={`format-icon-on${flip}`} />
        {isActive ? <strong>{name}</strong> : <span>{name}</span>}
    </span>;
}
