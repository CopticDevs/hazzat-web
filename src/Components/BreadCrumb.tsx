import MyNavLink from "./MyNavLink";

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
                    return <span key={i}><MyNavLink to={item.path} className="breadcrumbLink">{item.title}</MyNavLink> {(i === props.items.length - 1) ? "" : " > "}</span>
                }
                return item.title
            })}
        </div>
    );
}

export default BreadCrumb;
