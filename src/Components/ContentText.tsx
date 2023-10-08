import { useContext } from "react";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { LanguageContext } from "../LanguageContext";
import { ITextContent, IVariationInfo, TextColumn, TextParagraph } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import "./ContentText.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    variations: IVariationInfo<ITextContent>[];
}

interface IContentTable {
    colGroup: React.DetailedHTMLProps<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    rows: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>[];
}

function ContentText(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const { userSettings } = useContext(UserSettingsContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    const englishMask: number = 0x100;
    const copticMask: number = 0x010;
    const arabicMask: number = 0x001;

    const overrideEnglishStyle = {
        '--english-font-size': userSettings.englishFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'ltr'
    } as React.CSSProperties & { '--english-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

    const overrideArabicStyle = {
        '--arabic-font-size': userSettings.arabicFontSize,
        '--content-font-color': userSettings.contentFontColor,
        '--hazzat-font-color': userSettings.hazzatFontColor,
        direction: 'rtl'
    } as React.CSSProperties & { '--arabic-font-size': string; '--content-font-color': string; '--hazzat-font-color': string; };

    const getLanguageMask = (language: string): number => {
        if (language.toUpperCase() === "ENGLISH") {
            return englishMask;
        }
        if (language.toUpperCase() === "COPTIC") {
            return copticMask;
        }
        if (language.toUpperCase() === "ARABIC") {
            return arabicMask;
        }

        return 0;
    };

    const getTableMask = (columns: TextColumn[]): number => {
        let resultMask: number = 0;
        columns.forEach((col) => {
            resultMask |= getLanguageMask(col.language);
        });
        return resultMask;
    };

    let prevMask: number = 0;
    let currTableId: number = 0;
    let currRowId: number = 0;
    let currCelId: number = 0;
    let colDefId: number = 0;
    const contentTables: IContentTable[] = [];

    const ensureTableInstantiated = (currentMask: number) => {
        // Same as pprevious set of contents, use same table
        if (currentMask === prevMask) {
            return;
        }

        // define cols
        const colDefs: React.DetailedHTMLProps<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>[] = [];

        if ((currentMask & englishMask) !== 0) {
            colDefs.push(<col key={colDefId++} className="english-text-content" />);
        }

        if ((currentMask & copticMask) !== 0) {
            colDefs.push(<col key={colDefId++} className="coptic-text-content" />);
        }

        if ((currentMask & arabicMask) !== 0) {
            colDefs.push(<col key={colDefId++} className="arabic-text-content" />);
        }

        colDefs.push(<col key={colDefId++} className="separator-text-content" />)

        const colGroup = <colgroup>{colDefs}</colgroup>;

        contentTables.push({
            colGroup,
            rows: []
        });
    };

    const getColCell = (col: TextColumn, isComment: boolean, currentMask: number) => {
        const langMask = getLanguageMask(col.language);
        const cssClasses: string[] = [];
        const rowHasCoptic = (currentMask & copticMask) !== 0;
        const rowHasArabic = (currentMask & arabicMask) !== 0;
        const lang: string = langMask === arabicMask ? "ar" : "en";
        const overrideStyle = langMask === arabicMask ? overrideArabicStyle : overrideEnglishStyle;

        // add padding and textContent classes
        cssClasses.push("p-2 text-content");

        // add lang class
        if (isComment) {
            if (langMask === englishMask) cssClasses.push("english-text-content EnglishComment");
            if (langMask === copticMask) cssClasses.push("coptic-text-content CopticComment");
            if (langMask === arabicMask) cssClasses.push("arabic-text-content ArabicComment");
        } else {
            if (langMask === englishMask) cssClasses.push("english-text-content EnglishFont");
            if (langMask === copticMask) cssClasses.push("coptic-text-content CopticFont");
            if (langMask === arabicMask) cssClasses.push("arabic-text-content ArabicFont");
        }

        // align text to top
        cssClasses.push("textAlignTop");

        // Add right border if applicable
        if (!isComment) {
            if (langMask === englishMask && rowHasCoptic) cssClasses.push("contentRBorder");
            if (langMask === copticMask && rowHasArabic) cssClasses.push("contentRBorder");
        }

        // Add rtl for Arabic
        if (langMask === arabicMask) cssClasses.push("dirRtl");

        cssClasses.push("break-word");

        const className = cssClasses.join(" ");
        let stringSuffix = "";

        if (isComment) {
            stringSuffix = (langMask === copticMask) ? "@" : ":";
        }

        const cell = <td key={currCelId++} lang={lang} className={className} style={overrideStyle} dangerouslySetInnerHTML={{ __html: `${col.content}${stringSuffix}` }} />
        return cell;
    };

    const addContentRow = (columns: TextColumn[], isComment: boolean, currentMask: number) => {
        const cells = columns.map((col) => {
            return getColCell(col, isComment, currentMask);
        });

        cells.push(<td className="separator-text-content"><CrossDivider isMini={true} /></td>);

        const row = <tr key={currRowId++}>{cells}</tr>;

        contentTables[contentTables.length - 1].rows.push(row);
    };

    const generateContentTables = (paragraphs: TextParagraph[]) => {
        paragraphs && paragraphs.forEach((paragraph) => {
            // get current mask
            const currentMask = getTableMask(paragraph.columns);

            // ensure table instantiated
            ensureTableInstantiated(currentMask);

            // add a new row
            addContentRow(paragraph.columns, !!paragraph.isComment, currentMask);

            // update mask
            prevMask = currentMask;
        });

        const tables = contentTables.map((tbl) =>
            <table key={currTableId++} className="table-borderless" style={{ width: "100%" }}>
                {tbl.colGroup}
                <tbody>
                    {tbl.rows}
                </tbody>
            </table>
        );

        return tables;
    };

    return (
        <>
            {props.variations.map((variation) => {
                return <div key={variation.id}>
                    <div className={langClassName} style={{ paddingBottom: "20px", paddingTop: "20px" }}>
                        <HymnTitle content={variation.name} />
                    </div>
                    <div className="clear" />
                    <div className="table-responsive dirLtr">
                        {
                            generateContentTables(variation.content.paragraphs)
                        }
                    </div>
                    <CrossDivider />
                </div>
            })}
        </>
    );
}

export default ContentText;
