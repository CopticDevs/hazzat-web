import React, { useEffect, useRef, useState } from "react";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { StringMap } from "../Types/StringMap";
import FormatOptionsContextMenu from "./FormatOptionsContextMenu";
import "./HymnRow.css";
import MyNavLink from "./MyNavLink";

interface IProps {
    hymnName: string;
    isAlternate: boolean;
    getFormatsCallback: () => Promise<IFormatInfo[]>;
    parseFormatIdCallback: (fullFormatId: string) => string;
    handleFoundFormat?: (formatId: string) => void;
}

function HymnRow(props: IProps) {
    const [formatsMap, setFormatsMap] = useState<StringMap<string | undefined>>({});
    const [hymnFormatLink, setHymnFormatLink] = useState<string | undefined>(undefined);

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

        const initialFormatLink = resultFormatsMap["1"]
            || resultFormatsMap["2"]
            || resultFormatsMap["3"]
            || resultFormatsMap["4"]
            || resultFormatsMap["5"]
            || resultFormatsMap["6"]
            || resultFormatsMap["7"]
            || undefined;

        if (isMounted.current) {
            setFormatsMap(resultFormatsMap);
            setHymnFormatLink(initialFormatLink);
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
            <FormatOptionsContextMenu title={props.hymnName} formatsMap={formatsMap} />
            <div>
                {
                    !!hymnFormatLink ? <MyNavLink to={hymnFormatLink}>{props.hymnName}</MyNavLink> : props.hymnName
                }
            </div>
        </div>
    );
}

export default HymnRow;
