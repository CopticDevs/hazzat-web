import { useEffect, useRef, useState } from "react";
import { ReactComponent as HeadingBottom } from "../images/headingBottom.svg";
import "./HymnTitle.css";

interface IProps {
    content: string;
}

function HymnTitle(props: IProps) {
    const textRef = useRef<HTMLSpanElement>(null);
    const [svgWidth, setSvgWidth] = useState<number>(0);

    useEffect(() => {
        if (textRef.current) {
            setSvgWidth(textRef.current.offsetWidth);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (textRef.current) {
                setSvgWidth(textRef.current.offsetWidth);
            }
        };

        handleResize(); // Initial setup

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="hymnData">
            <h2><span ref={textRef}>{props.content}</span></h2>
            <div style={{width: svgWidth, overflow: "hidden"}}>
                <HeadingBottom  />
            </div>
            
        </div>
    );
}

export default HymnTitle;
