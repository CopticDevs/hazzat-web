import { NavLink, useLocation } from "react-router-dom";

interface IProps {
    to: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: any;
    children?: React.ReactNode;
}

function MyNavLink(props: IProps) {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const navTo = `${props.to}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return (
        <NavLink to={navTo} className={props.className} style={props.style} onClick={props.onClick}>
            {props.children}
        </NavLink>
    );
}

export default MyNavLink;
