import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { StringMap } from "../Types/StringMap";
import { strings } from "../l8n";
import FormatOptionMenuItem from "./FormatOptionMenuItem";
import { getFormatLinks } from "./formatLinks";
import "./FormatOptionsContextMenu.css";

interface Props { title: string; formatsMap: StringMap<string | undefined> }
export default function FormatOptionsContextMenu({ title, formatsMap }: Props) {
    const { search } = useLocation();
    const navigate = useNavigate();
    return <Dropdown className="format-dropdown">
        <Dropdown.Toggle variant="light" className="format-dropdown-toggle" aria-label={`${strings.formats}: ${title}`}>
            <FontAwesomeIcon icon={faChevronDown} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
            {getFormatLinks(formatsMap).map(option => <Dropdown.Item key={option.id} onClick={() => navigate(`${option.navLink}${search}`)}>
                <FormatOptionMenuItem formatId={option.id} title={title} fullFormatId={option.navLink} />
            </Dropdown.Item>)}
        </Dropdown.Menu>
    </Dropdown>;
}
