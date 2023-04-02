import tipImg from "../images/tip.gif";
import { strings } from "../l8n";

interface IProps {
    content: string;
}
function HelpTip(props: IProps) {

    return (
        <div className="container" style={{padding: "33px"} }>
            <div className="row">
                <div className="col-sm-1"><img src={tipImg} alt={strings.helpTip} /></div>
                <div className="col-sm-7 border">{props.content}</div>
            </div>
        </div>
    );
}

export default HelpTip;
