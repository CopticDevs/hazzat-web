import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from 'react-bootstrap';
import "./UserSettingsChanger.css";

function ToTopButton() {

    const goToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Button
            onClick={goToTop}
            className="modal-toggle"
            style={{ width: "45px" }}
        >
            <FontAwesomeIcon icon={faArrowUp} className="text-dark" />
        </Button>
    );
}

export default ToTopButton;
