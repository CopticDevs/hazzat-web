import React, { useContext, useEffect, useRef, useState } from "react";
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
import LoadingSpinner from "./LoadingSpinner";

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

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const servicePromise = hymnsDataProvider.getService(props.seasonId, props.serviceId);
        const hymnsPromise = hymnsDataProvider.getServiceHymnList(props.seasonId, props.serviceId);
        const [serviceResponse, hymnsResponse] = await Promise.all([servicePromise, hymnsPromise]);

        if (isMounted.current) {
            setServiceInfo(serviceResponse);
            setHymnsInfo(hymnsResponse.sort(HymnUtils.hymnInfoComparer));
            setIsLoading(false);
        }
    }, [languageProperties, props.seasonId, props.serviceId, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    let alternateHymn = true;

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !serviceInfo ? <></> :
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
            }
        </>
    );
}

export default ServiceContents;
