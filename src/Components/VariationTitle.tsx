import { ReactComponent as HeadingBottom } from "../images/headingBottom.svg";

interface IProps {
    content: string;
}

function VariationTitle(props: IProps) {
    
    return (
        <div className="variationData">
            <h3><span>{props.content}</span></h3>
            <div>
                <HeadingBottom />
            </div>
        </div>
    );
}

export default VariationTitle;
