import { ReactComponent as HeadingBottom } from "../images/headingBottom.svg";

interface IProps {
    content: string;
}

function HymnTitle(props: IProps) {
    
    return (
        <div className="hymnData">
            <h2><span>{props.content}</span></h2>
            <div>
                <HeadingBottom />
            </div>
            
        </div>
    );
}

export default HymnTitle;
