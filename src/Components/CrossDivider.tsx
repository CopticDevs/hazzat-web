import crossLine from "../images/crossline.gif";

function CrossDivider() {

    return (
        <div style={{ textAlign: "center" }}>
            <img src={crossLine} alt="cross" style={{ width: "70%", maxWidth: "508px" }} />
        </div>
    );
}

export default CrossDivider;
