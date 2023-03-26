import React, { useEffect, useRef, useState } from "react";
import space from "../images/space.gif";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { StringMap } from "../Types/StringMap";
import FormatLink from "./FormatLink";
import "./HymnRow.css";

interface IProps {
    hymnName: string;
    isAlternate: boolean;
    getFormatsCallback: () => Promise<IFormatInfo[]>;
    parseFormatIdCallback: (fullFormatId: string) => string;
}

function HymnRow(props: IProps) {
    const [formatsMap, setformatsMap] = useState<StringMap<string | undefined>>({});

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        const formatsResponse = await props.getFormatsCallback();
        
        const resultFormatMap: StringMap<string | undefined> = {};
        // update formats map
        formatsResponse.forEach((formatInfo) => {
            const formatId = props.parseFormatIdCallback(formatInfo.id);
            resultFormatMap[formatId] = formatInfo.id;
        });

        if (isMounted.current) {
            setformatsMap(resultFormatMap);
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
            <div className="contentLinksDiv">
                <img src={space} style={{ height: "25px", width: "10px", padding: "6px" }} alt="" />
                <FormatLink formatId="1" title={props.hymnName} fullFormatId={formatsMap["1"]} />
                <FormatLink formatId="2" title={props.hymnName} fullFormatId={formatsMap["2"]} />
                <FormatLink formatId="3" title={props.hymnName} fullFormatId={formatsMap["3"]} />
                <FormatLink formatId="4" title={props.hymnName} fullFormatId={formatsMap["4"]} />
                <FormatLink formatId="5" title={props.hymnName} fullFormatId={formatsMap["5"]} />
                <FormatLink formatId="6" title={props.hymnName} fullFormatId={formatsMap["6"]} />
                <FormatLink formatId="7" title={props.hymnName} fullFormatId={formatsMap["7"]} />
                <img src={space} style={{ height: "25px", width: "10px", padding: "6px" }} alt="" />
            </div>
            <div>{props.hymnName}</div>
        </div >
    );
}

export default HymnRow;
