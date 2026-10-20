import { CSSProperties } from "react";
import { strings } from "../l8n";

/** Direction belongs to the scroll container as well as its content, so overflowing
 * RTL glyph runs remain reachable without splitting encoded musical groups. */
export default function NotationContent({ content, language, style }: { content: string; language: 'en' | 'ar'; style: CSSProperties }) {
    return <div className="notation-scroll" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}
        role="region" tabIndex={0} aria-label={strings.notationScroll} style={style} dangerouslySetInnerHTML={{ __html: content }} />;
}
