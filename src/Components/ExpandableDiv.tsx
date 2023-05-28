import { faBookBible } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface IProps {
    children?: React.ReactNode;
}

function ExpandableDiv(props: IProps) {
    const [expanded, setExpanded] = useState(false);

    const handleToggleDiv = () => {
        setExpanded(!expanded);
    };

    return (
        <div>
            {
                !expanded ? <FontAwesomeIcon icon={faBookBible} className="text-muted" fontSize="22" onClick={handleToggleDiv} /> : props.children
            }
        </div>
    );
}

export default ExpandableDiv;
