import { useLocation } from "react-router-dom";
import { strings } from "../l8n";
import MyNavLink from "./MyNavLink";
interface Item { title: string; path?: string }
export default function BreadCrumb({ items }: { items: Item[] }) {
    const { pathname } = useLocation();
    return <nav className="breadcrumbDiv" aria-label={strings.breadcrumbs}><ol>
        {items.map((item, index) => <li key={index}>{item.path
            ? <MyNavLink to={item.path} end aria-current={item.path.toLowerCase() === pathname.toLowerCase() ? "page" : false}>{item.title}</MyNavLink>
            : <span aria-current="page">{item.title}</span>}</li>)}
    </ol></nav>;
}
