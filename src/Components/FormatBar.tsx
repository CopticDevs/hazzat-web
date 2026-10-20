import { StringMap } from "../Types/StringMap";
import { strings } from "../l8n";
import FormatOptionMenuItem from "./FormatOptionMenuItem";
import MyNavLink from "./MyNavLink";
import { getFormatLinks } from "./formatLinks";
import "./FormatBar.css";

interface Props { title: string; formatsMap: StringMap<string | undefined>; activeFormatId?: string }
export default function FormatBar({ title, formatsMap, activeFormatId }: Props) {
    const options = getFormatLinks(formatsMap);
    return <nav className="format-bar" aria-label={strings.formats}>
        <div className="format-links">
        {options.map(option => <MyNavLink key={option.id} to={option.navLink}
            aria-current={activeFormatId === option.id ? "page" : false}>
            <FormatOptionMenuItem formatId={option.id} title={title} fullFormatId={option.navLink} isActive={activeFormatId === option.id} />
        </MyNavLink>)}
        </div>
    </nav>;
}
