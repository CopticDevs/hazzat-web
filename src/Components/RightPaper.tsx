import { useContext } from "react";
import facebook from "../images/facebook.png";
import hymnBottom from "../images/hymnBottom.png";
import hymnTop from "../images/hymnTop.png";
import twitter from "../images/twitter.png";
import youtube from "../images/youtube.png";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";

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

                <div className="hymnData clearfix">
                    <h2><LocalizedMessage of="followUs" /></h2>
                </div>
                <div className="socialMedia clearfix" style={{paddingBottom: "40px"}}>

                    <a href="http://www.facebook.com/hazzat.com" target="_blank" rel="noreferrer">
                        <img src={facebook} alt="Facebook" />
                    </a>

                    <a href="http://www.twitter.com/CopticHazzat" target="_blank" rel="noreferrer">
                        <img src={twitter} alt="" />
                    </a>

                    <a href="http://www.youtube.com/CopticHazzat" target="_blank" rel="noreferrer">
                        <img src={youtube} alt="" />
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
