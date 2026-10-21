import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { strings } from "../l8n";
import "./UserSettingsChanger.css";
export default function ToTopButton() {
    return <Button className="reader-tool" variant="light" aria-label={strings.backToTop} onClick={() => {
        window.scrollTo({ top: 0, behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        window.gtag?.("event", "button_click", { event_category: "Engagement", event_label: "ToTop Button Clicked" });
    }}><FontAwesomeIcon icon={faArrowUp} /></Button>;
}
