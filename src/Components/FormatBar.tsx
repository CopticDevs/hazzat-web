import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { formatDisplayName } from "../Providers/HymnsDataProvider/FormatNames";
import { StringMap } from "../Types/StringMap";
import { strings } from "../l8n";
import FormatOptionMenuItem from "./FormatOptionMenuItem";
import MyNavLink from "./MyNavLink";
import { getFormatLinks } from "./formatLinks";
import "./FormatBar.css";

interface Props { title: string; formatsMap: StringMap<string | undefined>; activeFormatId?: string }
export default function FormatBar({ title, formatsMap, activeFormatId }: Props) {
    const navigate = useNavigate();
    const { search } = useLocation();
    const { languageProperties } = useContext(LanguageContext);
    const options = getFormatLinks(formatsMap);
    return <nav className="format-bar" aria-label={strings.formats}>
        <label className="mobile-format-picker">
            <span className="visually-hidden">{strings.formats}</span>
            <select className="form-select" value={activeFormatId || options[0]?.id || ""} onChange={event => {
                const option = options.find(item => item.id === event.target.value);
                if (option) navigate(`${option.navLink}${search}`);
            }}>
                {options.map(option => <option key={option.id} value={option.id}>{formatDisplayName(option.id, languageProperties.localeName)}</option>)}
            </select>
        </label>
        <div className="format-links">
        {options.map(option => <MyNavLink key={option.id} to={option.navLink}
            aria-current={activeFormatId === option.id ? "page" : false}>
            <FormatOptionMenuItem formatId={option.id} title={title} fullFormatId={option.navLink} isActive={activeFormatId === option.id} />
        </MyNavLink>)}
        </div>
    </nav>;
}
