import hymnTop from "../images/hymnTop.png";
import facebook from "../images/facebook.png";
import twitter from "../images/twitter.png";
import youtube from "../images/youtube.png";
import hymnBottom from "../images/hymnBottom.png";

interface IProps {
    children?: React.ReactNode;
}

function RightPaper(props: IProps) {
    return (
        <div className="hymnLeft fLeft">
            <div className="md">
                <img src={hymnTop} alt="" />
            </div>

            <div className="hymnRep clearfix">

                <div className="hymnData clearfix">
                    <h2>Follow us</h2>
                </div>
                <div className="socialMedia clearfix" style={{paddingBottom: "40px"}}>

                    <a href="http://www.facebook.com/hazzat.com" target="_blank">
                        <img src={facebook} alt="Facebook" />
                    </a>

                    <a href="http://www.twitter.com/CopticHazzat" target="_blank">
                        <img src={twitter} alt="" />
                    </a>

                    <a href="http://www.youtube.com/CopticHazzat" target="_blank">
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

export default RightPaper;
