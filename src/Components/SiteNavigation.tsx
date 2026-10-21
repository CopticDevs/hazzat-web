import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { INavMenuItem } from "../Types/INavMenuItem";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import LanguageSwitcher from "./LanguageSwitcher";
import MyNavLink from "./MyNavLink";
import SitePreferences from "./SitePreferences";

interface Props { id: string; navItems: INavMenuItem[]; footer?: boolean }
export default function SiteNavigation({ id, navItems, footer = false }: Props) {
    const [expanded, setExpanded] = useState(false);
    const ref = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const { pathname, search } = useLocation();
    useEffect(() => { setExpanded(false); }, [pathname, search]);
    useEffect(() => {
        if (footer && expanded) ref.current?.scrollIntoView({ block: "end", behavior: "auto" });
    }, [footer, expanded]);
    useEffect(() => {
        const outside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setExpanded(false);
        };
        document.addEventListener("click", outside);
        return () => document.removeEventListener("click", outside);
    }, []);
    return <nav className={footer ? "footer-nav" : "site-nav"} ref={ref}
        aria-label={footer ? strings.footerNavigation : strings.mainNavigation}
        onKeyDown={event => {
            if (event.key === "Escape" && expanded) {
                setExpanded(false); toggleRef.current?.focus();
            }
        }}>
        <button type="button" className="mobile-menu-toggle" ref={toggleRef}
            aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>
            <FontAwesomeIcon icon={faBars} /> <LocalizedMessage of="menu" />
        </button>
        <ul id={id} className={`site-menu${expanded ? " is-open" : ""}`}
            onClick={event => {
                if ((event.target as Element).closest("a[href]")) setExpanded(false);
            }}>
            {navItems.filter(item => !item.disabled).map(item => <li key={item.id}>
                <MyNavLink to={item.location} end><LocalizedMessage of={item.id} /></MyNavLink>
            </li>)}
            {!footer && <li><MyNavLink to="/Search"><FontAwesomeIcon icon={faSearch} /> <LocalizedMessage of="search" /></MyNavLink></li>}
            {footer && <LanguageSwitcher />}
        </ul>
        {!footer && <SitePreferences />}
    </nav>;
}
