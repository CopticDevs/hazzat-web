import LocalizedMessage from "../LocalizedMessage";
import "./LoadingSpinner.css";

function LoadingSpinner() {
    return (
        <div className="spinnerDiv">
            <div className="loading-spinner"></div>
            <div className="centered">
                <LocalizedMessage of="loading" />
            </div>
        </div>
    );
}

export default LoadingSpinner;
