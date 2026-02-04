import React, { useEffect, useRef, useState } from "react";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { StringMap } from "../Types/StringMap";
import Content from "./Content";
import FormatBar from "./FormatBar";
import FormatOptionsContextMenu from "./FormatOptionsContextMenu";
import "./HymnRow.css";
import MyNavLink from "./MyNavLink";

interface IProps {
    hymn: IHymnInfo;
    seasonId: string;
    serviceId: string;
    isAlternate: boolean;
    handleFoundFormat?: (formatId: string) => void;
    isExpanded?: boolean;
    selectedFormatId?: string;
}

function HymnRow(props: IProps) {
    const [formatsMap, setFormatsMap] = useState<StringMap<string | undefined>>({});
    const [hymnFormatLink, setHymnFormatLink] = useState<string | undefined>(undefined);
    const [activeFormatId, setActiveFormatId] = useState<string | undefined>(props.selectedFormatId);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        
        // Process embedded formats from hymn data
        const resultFormatsMap: StringMap<string | undefined> = {};
        const formats = props.hymn.formats || [];
        
        formats.forEach((formatInfo) => {
            const formatId = formatInfo.id;
            resultFormatsMap[formatId] = `/seasons/${props.seasonId}/services/${props.serviceId}/hymns/${props.hymn.id}/formats/${formatId}`;

            if (props.handleFoundFormat) {
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
            
            // Set active format if not already set
            if (!activeFormatId && formats.length > 0) {
                setActiveFormatId(formats[0].id);
            }
        }

        return () => {
            isMounted.current = false;
        };
    }, [props.hymn, props.seasonId, props.serviceId, props.handleFoundFormat, activeFormatId]);

    // Update active format when selectedFormatId changes
    useEffect(() => {
        if (props.selectedFormatId) {
            setActiveFormatId(props.selectedFormatId);
        }
    }, [props.selectedFormatId]);

    if (!isMounted.current) {
        return (<div />)
    }

    // If expanded, show the hymn content with format bar
    if (props.isExpanded && activeFormatId) {
        const activeFormat = props.hymn.formats?.find(f => f.id === activeFormatId);
        
        return (
            <div className="hymn-expanded">
                <FormatBar
                    title={props.hymn.displayName}
                    formatsMap={formatsMap}
                    activeFormatId={activeFormatId}
                />
                {activeFormat && (
                    <Content 
                        formatId={activeFormatId} 
                        variationsCallback={async () => activeFormat.variations || []}
                    />
                )}
            </div>
        );
    }

    return (
        <div className={props.isAlternate ? `alternate contentLinksDiv` : "contentLinksDiv"} style={{ padding: "6px" }}>
            <FormatOptionsContextMenu title={props.hymn.displayName} formatsMap={formatsMap} />
            <div>
                {
                    !!hymnFormatLink ? <MyNavLink to={hymnFormatLink}>{props.hymn.displayName}</MyNavLink> : props.hymn.displayName
                }
            </div>
        </div>
    );
}

export default HymnRow;
