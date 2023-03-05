import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { getHymnNumberFromId } from "../Utils/ParserUtils";
import HymnRow from "./HymnRow";
import "./HymnRow.css";
import HymnTitle from "./HymnTitle";

interface IProps {
    seasonId: string;
    serviceId: string;
}

function ServiceContents(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [hymns, setHymnsInfo] = useState<IHymnInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    const fetchService = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const serviceResponse = await hymnsDataProvider.getService(props.seasonId, props.serviceId);
        setServiceInfo(serviceResponse);
    }, [languageProperties, props.seasonId, props.serviceId]);

    const fetchHymns = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const hymnsResponse = await hymnsDataProvider.getServiceHymnList(props.seasonId, props.serviceId);
        setHymnsInfo(hymnsResponse.sort(HymnUtils.hymnInfoComparer));
    }, [languageProperties, props.seasonId, props.serviceId]);

    useEffect(() => {
        setIsLoading(true);
        fetchService();
        fetchHymns();
        setIsLoading(false);
    }, [fetchService, fetchHymns]);

    if (isLoading || !serviceInfo) {
        return (<div/>)
    }

    let alternateHymn = true;

    return (
        <div style={{ padding: "7px 3px 7px 3px", marginTop: "30px" }}>
            <div className={langClassName}>
                <HymnTitle content={serviceInfo.name} />
            </div>
            <div className="clear" />
            {hymns.map((hymn) => {
                alternateHymn = !alternateHymn;
                const hymnId = getHymnNumberFromId(hymn.id);
                return <HymnRow key={hymn.id} seasonId={props.seasonId} serviceId={props.serviceId} hymnId={hymnId} isAlternate={alternateHymn} />
            })}
        </div>
    );
}

export default ServiceContents;
