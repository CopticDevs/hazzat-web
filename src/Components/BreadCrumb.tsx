import { NavLink } from "react-router-dom";

interface IItem {
    title: string;
    path?: string;
}
interface IProps {
    items: IItem[];
}

function BreadCrumb(props: IProps) {
    
    return (
        <div className="breadcrumbDiv">
            {props.items.map((item, i) => {
                if (!!item.path) {
                    return <span key={i}><NavLink to={item.path} className="breadcrumbLink">{item.title}</NavLink> {(i === props.items.length - 1) ? "" : " > "}</span>
                }
                return item.title
            })}
        </div>
    );
}

export default BreadCrumb;
