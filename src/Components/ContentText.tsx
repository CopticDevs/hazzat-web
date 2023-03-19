import { useContext } from "react";
import { LanguageContext } from "../LanguageContext";
import { ITextContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./Content.css";
import CrossDivider from "./CrossDivider";
import HymnTitle from "./HymnTitle";

interface IProps {
    formatId: string;
    variations: IVariationInfo<ITextContent>[];
}

function ContentText(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    //const englishMask: number = 0x100;
    //const copticMask: number = 0x010;
    //const arabicMask: number = 0x001;

    //const getTableMask = (columns: TextColumn[]): number => {
    //    let resultMask: number = 0;
    //    columns.forEach((col) => {
    //        if (col.language.toUpperCase() === "ENGLISH") {
    //            resultMask |= englishMask;
    //            return;
    //        }
    //        if (col.language.toUpperCase() === "COPTIC") {
    //            resultMask |= copticMask;
    //            return;
    //        }
    //        if (col.language.toUpperCase() === "ARABIC") {
    //            resultMask |= arabicMask;
    //            return;
    //        }
    //    });
    //    return resultMask;
    //};

    //let prevMask: number = 0;

    return (
        <>
            {props.variations.map((variation) => {
                return <div key={variation.id}>
                    <div className={langClassName} style={{ paddingBottom: "20px", paddingTop: "20px" }}>
                        <HymnTitle content={variation.name} />
                    </div>
                    <div className="clear" />
                    <div className="table-responsive dirLtr">
                        {/*{*/}
                        {/*    variation.content.paragraphs.map((paragraph, i) => {*/}
                        {/*        let resultControl: JSX.Element;*/}
                        {/*        const currentMask = getTableMask(paragraph.columns);*/}
                                
                        {/*        if (currentMask !== prevMask || i === 0) {*/}
                        {/*        }*/}



                        {/*    })*/}
                        {/*}*/}
                    
                        {/*<table className="table-borderless">*/}
                        {/*    <colgroup>*/}
                        {/*        <col style={{ width: "29%" }} />*/}
                        {/*        <col style={{ width: "50%" }} />*/}
                        {/*        <col style={{ width: "21%" }} />*/}
                        {/*    </colgroup>*/}
                        {/*    <tbody>*/}
                        {/*        <tr>*/}
                        {/*            <td lang="en" className="p-2 EnglishFont contentRBorder">{variation.content?.paragraphs[0]?.columns[0]?.content}</td>*/}
                        {/*            <td lang="en" className="p-2 CopticFont contentRBorder">{variation.content?.paragraphs[0]?.columns[1]?.content}</td>*/}
                        {/*            <td lang="ar" className="p-2 ArabicFont dirRtl">{variation.content?.paragraphs[0]?.columns[2]?.content}</td>*/}
                        {/*        </tr>*/}
                        {/*        <tr>*/}
                        {/*            <td lang="en" className="p-2 EnglishFont contentRBorder">{variation.content?.paragraphs[1]?.columns[0]?.content}</td>*/}
                        {/*            <td lang="en" className="p-2 CopticFont contentRBorder">{variation.content?.paragraphs[1]?.columns[1]?.content}</td>*/}
                        {/*            <td lang="ar" className="p-2 ArabicFont dirRtl">{variation.content?.paragraphs[1]?.columns[2]?.content}</td>*/}
                        {/*        </tr>*/}
                        {/*        <tr>*/}
                        {/*            <td lang="en" className="p-2 EnglishFont contentRBorder">{variation.content?.paragraphs[2]?.columns[0]?.content}</td>*/}
                        {/*            <td lang="en" className="p-2 CopticFont contentRBorder">{variation.content?.paragraphs[2]?.columns[1]?.content}</td>*/}
                        {/*            <td lang="ar" className="p-2 ArabicFont dirRtl">{variation.content?.paragraphs[2]?.columns[2]?.content}</td>*/}
                        {/*        </tr>*/}
                        {/*    </tbody>*/}
                        {/*</table>*/}
                    </div>
                    <CrossDivider />
                </div>
            })}
        </>
    );
}

export default ContentText;
