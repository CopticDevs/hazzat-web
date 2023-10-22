import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from 'react-bootstrap';
import "./UserSettingsChanger.css";

function ToTopButton() {

    const collectAnalytics = () => {
        // Track button click
        window.gtag('event', 'button_click', {
            event_category: 'Engagement',
            event_label: 'ToTop Button Clicked',
        });
    };

    const goToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        collectAnalytics();
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
