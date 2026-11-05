import { ReactComponent as Logo } from "../images/logo.svg";
import { INavMenuItem } from "../Types/INavMenuItem";
import { strings } from "../l8n";
import MyNavLink from "./MyNavLink";
import SiteNavigation from "./SiteNavigation";

export default function Header({ navItems }: { navItems: INavMenuItem[] }) {
    return <header className="header">
        <div className="innerHeader"><div className="logo">
            <MyNavLink to="/" aria-label={`Hazzat — ${strings.home}`}><Logo aria-hidden="true" focusable="false" /></MyNavLink>
        </div></div>
        <SiteNavigation id="header-navigation" navItems={navItems} />
    </header>;
}
