import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Dropdown } from 'react-bootstrap';
import { StringMap } from "../Types/StringMap";
import FormatOptionMenuItem from "./FormatOptionMenuItem";
import "./FormatOptionsContextMenu.css";

interface IFormatItem {
    id: string;
    navLink: string;
}

interface IProps {
    title: string;
    formatsMap: StringMap<string | undefined>;
}

function FormatOptionsContextMenu(props: IProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [formatList, setFormatsList] = useState<IFormatItem[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        const resultFormatList: IFormatItem[] = [];

        for (let i = 1; i <= 7; i++) {
            const currentLink = props.formatsMap[`${i}`];
            if (currentLink === undefined) continue;

            resultFormatList.push({
                id: `${i}`,
                navLink: currentLink
                });
        }

        setFormatsList(resultFormatList);

    }, [props.formatsMap]);

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        setShowMenu(!showMenu);
        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.style.top = `${event.pageY}px`;
            menu.style.left = `${event.pageX}px`;
        }
    };

    return (
        <div onContextMenu={handleContextMenu} onClick={handleContextMenu} ref={menuRef}>
            <FontAwesomeIcon
                icon={faChevronDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                color={isHovered ? "#454545" : "#6c757d"}
                className={isHovered ? 'bounce' : ''}
                style={{ paddingLeft: "10px", paddingRight: "10px" }}
                fontSize="22" />
            {showMenu && (
                <Dropdown id="context-menu" show={true}>
                    <Dropdown.Menu>
                        {formatList.map((option) => (
                            <FormatOptionMenuItem key={option.id}
                                formatId={option.id}
                                title={props.title}
                                fullFormatId={option.navLink} />
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </div>
    );
}

export default FormatOptionsContextMenu;
