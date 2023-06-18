import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
    content: string;
}
function HelpTip(props: IProps) {

    return (
        <div className="container" style={{padding: "33px"} }>
            <div className="row">
                <div className="col-sm-1"><FontAwesomeIcon icon={faLightbulb} className="text-dark" style={{ fontSize: "33px" }} /></div>
                <div className="col-sm-7 border">{props.content}</div>
            </div>
        </div>
    );
}

export default HelpTip;
