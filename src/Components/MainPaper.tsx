import welcomeBottom from "../images/welcomeBottom.png";
import welcomeBottomMobile from "../images/welcomeBottomMobile.png";
import welcomeTop from "../images/welcomeTop.png";
import welcomeTopMobile from "../images/welcomeTopMobile.png";
import "./MainPaper.css";

export enum Size {
    Normal,
    Wide
}

interface IProps {
    size?: Size;
    children?: React.ReactNode;
}

function MainPaper(props: IProps) {
    return (
        <div className={props.size === Size.Wide ? "leftMainWide fLeft" : "leftMain fLeft"}>
            <div className="welcomeMain clearfix">
                <div className="welcome clearfix">

                    <div className="md">
                        <img src={welcomeTop} className={props.size === Size.Wide ? "wideTopImage" : "topImage"} alt="" />
                        <img src={welcomeTopMobile} className="welcomeTopMobile" alt="" />
                    </div>

                    <div className="welcomeRep clearfix">
                        {props.children}
                    </div>

                    <div className="md">
                        <img src={welcomeBottom} className={props.size === Size.Wide ? "wideBottomImage" : "bottomImage"} alt="" />
                        <img src={welcomeBottomMobile} alt="" className="welcomeBottomMobile"/>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default MainPaper;
