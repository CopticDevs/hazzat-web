import { ReactComponent as CrossLine } from "../images/crossline.svg";

function CrossDivider() {

    return (
        <div style={{ textAlign: "center" }}>
            <CrossLine style={{ width: "70%", maxWidth: "508px", marginTop: "10px", marginBottom: "10px" }} />
        </div>
    );
}

export default CrossDivider;
