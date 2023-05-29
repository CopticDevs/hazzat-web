import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { Button } from 'react-bootstrap';
import { LanguageContext } from "../LanguageContext";
import "./UserSettingsChanger.css";

function ToTopButton() {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "position-fixed start-0 modal-toggle" : "position-fixed end-0 modal-toggle";

    const goToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Button
            onClick={goToTop}
            className={langClassName}
            style={{ zIndex: 100, top: '25%', width: "45px" }}
        >
            <FontAwesomeIcon icon={faArrowUp} className="text-dark" />
        </Button>
    );
}

export default ToTopButton;
