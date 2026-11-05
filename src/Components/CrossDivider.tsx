import { ReactComponent as CrossLineImg } from "../images/crossline.svg";
import { ReactComponent as CrossesDividerImg } from "../images/crossesDivider.svg";
import "./CrossDivider.css";

interface IProps {
    isMini?: boolean;
}
function CrossDivider(props: IProps) {

    if (props.isMini) {
        return (
            <div className="cross-divider">
                <CrossesDividerImg style={{ width: "50px", marginBottom: "20px" }} />
            </div>
        );
    }

    return (
        <div className="cross-divider">
            <CrossLineImg style={{ width: "70%", maxWidth: "508px", marginTop: "10px", marginBottom: "10px" }} />
        </div>
    );
}

export default CrossDivider;
