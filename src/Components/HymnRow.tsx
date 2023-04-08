import React, { useEffect, useRef, useState } from "react";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { StringMap } from "../Types/StringMap";
import FormatOptionLinks, { DisplayType } from "./FormatOptionLinks";
import "./HymnRow.css";

interface IProps {
    hymnName: string;
    isAlternate: boolean;
    getFormatsCallback: () => Promise<IFormatInfo[]>;
    parseFormatIdCallback: (fullFormatId: string) => string;
    handleFoundFormat?: (formatId: string) => void;
}

function HymnRow(props: IProps) {
    const [formatsMap, setFormatsMap] = useState<StringMap<string | undefined>>({});

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        const formatsResponse = await props.getFormatsCallback();
        
        
        const resultFormatsMap: StringMap<string | undefined> = {};
        // update formats map
        formatsResponse.forEach((formatInfo) => {
            const formatId = props.parseFormatIdCallback(formatInfo.id);
            resultFormatsMap[formatId] = formatInfo.id;

            if (!!props.handleFoundFormat) {
                props.handleFoundFormat(formatId);
            }
        });

        if (isMounted.current) {
            setFormatsMap(resultFormatsMap);
        }
    }, [props, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    if (!isMounted.current) {
        return (<div />)
    }

    return (
        <div className={props.isAlternate ? `alternate contentLinksDiv` : "contentLinksDiv"} style={{ padding: "6px" }}>
            <FormatOptionLinks title={props.hymnName} display={DisplayType.Minimum} formatsMap={formatsMap} />
            <div>{props.hymnName}</div>
        </div >
    );
}

export default HymnRow;
