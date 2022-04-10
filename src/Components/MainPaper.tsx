import welcomeTop from "../images/welcomeTop.png";
import welcomeTopMobile from "../images/welcomeTopMobile.png";
import welcomeBottom from "../images/welcomeBottom.png";
import welcomeBottomMobile from "../images/welcomeBottomMobile.png";

interface IProps {
    children?: React.ReactNode;
}

function MainPaper(props: IProps) {
    return (
        <div className="leftMain fLeft">
            <div className="welcomeMain clearfix">
                <div className="welcome clearfix">

                    <div className="md">
                        <img src={welcomeTop} alt="" />
                        <img src={welcomeTopMobile} className="welcomeTopMobile" alt="" />
                    </div>

                    <div className="welcomeRep clearfix">
                        {props.children}
                    </div>

                    <div className="md">
                        <img src={welcomeBottom} alt="" />
                        <img src={welcomeBottomMobile} alt="" className="welcomeBottomMobile"/>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default MainPaper;
