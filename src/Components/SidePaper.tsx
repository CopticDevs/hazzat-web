import { useContext } from "react";
import hymnBottom from "../images/hymnBottom.png";
import hymnTop from "../images/hymnTop.png";
import { ReactComponent as YoutubeIcon } from "../images/youtube.svg";
import { ReactComponent as TwitterIcon } from "../images/twitter.svg";
import { ReactComponent as FacebookIcon } from "../images/facebook.svg";
import { LanguageContext } from "../LanguageContext";
import HymnTitle from "./HymnTitle";
import { strings } from "../l8n";

interface IProps {
    children?: React.ReactNode;
}

function SidePaper(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "dirRtl" : "";

    return (
        <div className={`hymnLeft fLeft ${langClassName}`}>
            <div className="md">
                <img src={hymnTop} alt="" />
            </div>

            <div className="hymnRep clearfix">

                <HymnTitle content={strings.followUs} />
                <div className="socialMedia clearfix" style={{paddingBottom: "40px"}}>

                    <a href="http://www.facebook.com/hazzat.com" target="_blank" rel="noreferrer">
                        <FacebookIcon />
                    </a>

                    <a href="http://www.twitter.com/CopticHazzat" target="_blank" rel="noreferrer">
                        <TwitterIcon />
                    </a>

                    <a href="http://www.youtube.com/CopticHazzat" target="_blank" rel="noreferrer">
                        <YoutubeIcon />
                    </a>

                </div>

                <div className="hymnData clearfix">

                    <div id="RightTopContentPane" className="hymnData clearfix">
                        {props.children}
                    </div>
                </div>

                <div className="hymnData clearfix">

                    <div id="RightBottomContentPane"  className="hymnData clearfix">
                    </div>

                </div>

            </div>

            <div className="md">
                <img src={hymnBottom} alt="" />
            </div>
            
        </div>
    );
}

export default SidePaper;
