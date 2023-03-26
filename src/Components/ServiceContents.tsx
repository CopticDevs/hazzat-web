import React, { useContext, useEffect, useRef, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { getFormatNumberFromId, getHymnNumberFromId } from "../Utils/ParserUtils";
import HymnRow from "./HymnRow";
import "./HymnRow.css";
import HymnTitle from "./HymnTitle";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    seasonId: string;
    serviceId: string;
    serviceName: string;
}

function ServiceContents(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [hymns, setHymnsInfo] = useState<IHymnInfo[]>([]);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";
    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const hymnsResponse = await hymnsDataProvider.getServiceHymnList(props.seasonId, props.serviceId);

        if (isMounted.current) {
            setHymnsInfo(hymnsResponse.sort(HymnUtils.hymnInfoComparer));
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
                !isMounted.current ? <LoadingSpinner /> :
                    <div style={{ padding: "7px 3px 7px 3px", marginTop: "30px" }}>
                        <div className={langClassName}>
                            <HymnTitle content={props.serviceName} />
                        </div>
                        <div className="clear" />
                        {hymns.map((hymn) => {
                            alternateHymn = !alternateHymn;
                            const hymnId = getHymnNumberFromId(hymn.id);

                            const getFormatsCallback = () => {
                                const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
                                return hymnsDataProvider.getServiceHymnFormatList(props.seasonId, props.serviceId, hymnId);
                            };

                            return <HymnRow key={hymn.id} hymnName={hymn.name} isAlternate={alternateHymn} getFormatsCallback={getFormatsCallback} parseFormatIdCallback={getFormatNumberFromId} />
                        })}
                    </div>
            }
        </>
    );
}

export default ServiceContents;
