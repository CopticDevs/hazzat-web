import { INavMenuItem } from "../Types/INavMenuItem";
import SiteNavigation from "./SiteNavigation";

export default function Footer({ navItems }: { navItems: INavMenuItem[] }) {
    return <footer className="footer"><SiteNavigation id="footer-navigation" navItems={navItems} footer /></footer>;
}
