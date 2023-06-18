import { ReactComponent as HeadingBottom } from "../images/headingBottom.svg";
import "./HymnTitle.css";

interface IProps {
    content: string;
}

function HymnTitle(props: IProps) {
    
    return (
        <div className="hymnData">
            <h2><span>{props.content}</span></h2>
            <div className="line-bg">
                <HeadingBottom />
            </div>
            
        </div>
    );
}

export default HymnTitle;
