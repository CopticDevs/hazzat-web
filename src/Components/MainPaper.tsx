import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import "./MainPaper.css";

export enum Size {
    Normal,
    Wide
}

interface IProps {
    size?: Size;
    children?: React.ReactNode;
}

function MainPaper(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "dirRtl" : "";

    return (
        <div className={props.size === Size.Wide ? `mainPaper widePaper ${langClassName}` : `mainPaper ${langClassName}`}>
            {props.children}
        </div>
    );
}

export default MainPaper;
