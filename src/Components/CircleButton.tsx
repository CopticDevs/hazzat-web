import { useState } from "react";

interface IProps {
    fill: string;
    active: boolean;
    setActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function CircleButton(props: IProps) {
    const { active, setActive } = props;
    const [hover, setHover] = useState(false);

    const handleActivate = () => {
        setActive(!active);
    };

    

    return (
        <div style={{ width: "80px", height: "80px" }}>
        <svg
            viewBox="-3 -3 60 60"
            xmlns="http://www.w3.org/2000/svg"
                onClick={handleActivate}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}>
            <circle
                cx="25px"
                cy="25px"
                r="25px"
                width="25px"
                height="25px"
                fill={props.fill}
                stroke={active || hover ? "black" : "none"}
                strokeWidth="3px"
            />
            </svg>
        </div>
    );
    
}

export default CircleButton;
