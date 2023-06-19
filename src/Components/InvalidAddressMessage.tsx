import LocalizedMessage from "../LocalizedMessage";
import MyNavLink from "./MyNavLink";

function InvalidAddressMessage() {

    return (
        <div style={{ paddingTop: "50px", paddingBottom: "50px" }}>
            <LocalizedMessage of="noContent" />
            <div style={{ paddingTop: "10px", textAlign: "center" }}>
                <MyNavLink to="/"><strong><LocalizedMessage of="home" /></strong></MyNavLink>
            </div>
        </div>
    );
}

export default InvalidAddressMessage;
