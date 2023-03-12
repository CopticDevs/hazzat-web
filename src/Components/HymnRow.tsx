import React, { useEffect } from "react";
import { useContext, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { StringMap } from "../Types/StringMap";
import { getFormatNumberFromId } from "../Utils/ParserUtils";
import FormatLink from "./FormatLink";
import space from "../images/space.gif";
import "./HymnRow.css";

interface IProps {
    seasonId: string;
    serviceId: string;
    hymnId: string;
    isAlternate: boolean;
}

function HymnRow(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [hymnInfo, setHymnInfo] = useState<IHymnInfo | undefined>();
    const [formatsMap, setformatsMap] = useState<StringMap<string | undefined>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const hymnPromise = hymnsDataProvider.getServiceHymn(props.seasonId, props.serviceId, props.hymnId);
        const formatsPromise = hymnsDataProvider.getServiceHymnFormatList(props.seasonId, props.serviceId, props.hymnId);
        const [hymnResponse, formatsResponse] = await Promise.all([hymnPromise, formatsPromise]);

        const resultFormatMap: StringMap<string | undefined> = {};
        // update formats map
        formatsResponse.forEach((formatInfo) => {
            const formatId = getFormatNumberFromId(formatInfo.id);
            resultFormatMap[formatId] = formatInfo.id;
        });

        setformatsMap(resultFormatMap);
        setHymnInfo(hymnResponse);
        setIsLoading(false);
    }, [languageProperties, props.seasonId, props.serviceId, props.hymnId]);

    useEffect(() => {
        fetchFromBackend();
    }, [fetchFromBackend]);

    if (isLoading || !hymnInfo) {
        return (<div />)
    }

    return (
        <div className={props.isAlternate ? `alternate contentLinksDiv` : "contentLinksDiv"} style={{ padding: "6px" }}>
            <div className="contentLinksDiv">
                <img src={space} style={{ height: "20px", width: "10px", padding: "6px" }} alt="" />
                <FormatLink formatId="1" title={hymnInfo.name} fullFormatId={formatsMap["1"]} />
                <FormatLink formatId="2" title={hymnInfo.name} fullFormatId={formatsMap["2"]} />
                <FormatLink formatId="3" title={hymnInfo.name} fullFormatId={formatsMap["3"]} />
                <FormatLink formatId="4" title={hymnInfo.name} fullFormatId={formatsMap["4"]} />
                <FormatLink formatId="5" title={hymnInfo.name} fullFormatId={formatsMap["5"]} />
                <FormatLink formatId="6" title={hymnInfo.name} fullFormatId={formatsMap["6"]} />
                <FormatLink formatId="7" title={hymnInfo.name} fullFormatId={formatsMap["7"]} />
                <img src={space} style={{ height: "20px", width: "10px", padding: "6px" }} alt="" />
            </div>
            <div>
                {hymnInfo.name}
            </div>
        </div >
    );
}

export default HymnRow;
