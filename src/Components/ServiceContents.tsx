import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { StringMap } from "../Types/StringMap";
import CrossDivider from "./CrossDivider";
import FormatOptionsContextMenu from "./FormatOptionsContextMenu";
import HymnRow from "./HymnRow";
import "./HymnRow.css";
import HymnTitle from "./HymnTitle";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

interface IProps {
    seasonId: string;
    serviceId: string;
    serviceName: string;
}

function ServiceContents(props: IProps) {
    // Parse URL parameters for deep linking
    const { hymnId, formatId } = useParams();
    const hymnIdParam = hymnId;
    const formatIdParam = formatId;

    const getLoadingSpinnerDiv = () => {
        return <div key="loading"><LoadingSpinner /></div>;
    };

    const loadingDiv = useMemo(() => getLoadingSpinnerDiv(), []);
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [hymns, setHymnsInfo] = useState<IHymnInfo[]>([]);
    const [hymnsNodes, setHymnsNodes] = useState<React.ReactNode[]>([loadingDiv]);
    const [hasText, setHasText] = useState<boolean>(false);
    const [hasHazzat, setHasHazzat] = useState<boolean>(false);
    const [hasVerticalHazzat, setHasVerticalHazzat] = useState<boolean>(false);
    const [hasMusicalNotes, setHasMusicalNotes] = useState<boolean>(false);
    const [hasAudio, setHasAudio] = useState<boolean>(false);
    const [hasVideo, setHasVideo] = useState<boolean>(false);
    const [hasInformation, setHasInformation] = useState<boolean>(false);
    const [serviceFormatsMap, setServiceFormatsMap] = useState<StringMap<string | undefined>>({});
    const [serviceFormatLink, setServiceFormatLink] = useState<string | undefined>(undefined);
    const isMounted = useRef(true);

    const handleFoundFormat = (formatId: string) => {
        switch (formatId) {
            case "1":
                setHasText(true);
                break;
            case "2":
                setHasHazzat(true);
                break;
            case "3":
                setHasVerticalHazzat(true);
                break;
            case "4":
                setHasMusicalNotes(true);
                break;
            case "5":
                setHasAudio(true);
                break;
            case "6":
                setHasVideo(true);
                break;
            case "7":
                setHasInformation(true);
                break;
        }
    };

    useEffect(() => {
        const resultMap: StringMap<string | undefined> = {};

        resultMap["1"] = hasText ? `/seasons/${props.seasonId}/services/${props.serviceId}/formats/1` : undefined;
        resultMap["2"] = hasHazzat ? `/seasons/${props.seasonId}/services/${props.serviceId}/formats/2` : undefined;
        resultMap["3"] = hasVerticalHazzat ? `/seasons/${props.seasonId}/services/${props.serviceId}/formats/3` : undefined;
        resultMap["4"] = hasMusicalNotes ? `/seasons/${props.seasonId}/services/${props.serviceId}/formats/4` : undefined;
        resultMap["5"] = hasAudio ? `/seasons/${props.seasonId}/services/${props.serviceId}/formats/5` : undefined;
        resultMap["6"] = hasVideo ? `/seasons/${props.seasonId}/services/${props.serviceId}/formats/6` : undefined;
        resultMap["7"] = hasInformation ? `/seasons/${props.seasonId}/services/${props.serviceId}/formats/7` : undefined;
        
        setServiceFormatsMap(resultMap);

        const initialFormatIdStr =
            hasText ? "1" :
                hasHazzat ? "2" :
                    hasVerticalHazzat ? "3" :
                        hasMusicalNotes ? "4" :
                            hasAudio ? "5" :
                                hasVideo ? "6" :
                                    hasInformation ? "7" : undefined;

        if (initialFormatIdStr) {
            setServiceFormatLink(`/seasons/${props.seasonId}/services/${props.serviceId}/formats/${initialFormatIdStr}`);
        }
    }, [props.seasonId, props.serviceId, hasText, hasHazzat, hasVerticalHazzat, hasMusicalNotes, hasAudio, hasVideo, hasInformation]);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        
        // Fetch service with embedded hymns from S3
        const serviceResponse = await hymnsDataProvider.getService(props.seasonId, props.serviceId);

        if (isMounted.current && serviceResponse) {
            // Extract hymns from embedded service data
            const embeddedHymns = serviceResponse.hymns || [];
            setHymnsInfo([...embeddedHymns].sort(HymnUtils.hymnInfoComparer));
        }
    }, [languageProperties, environmentProperties, props.seasonId, props.serviceId]);

    useEffect(() => {
        let alternateHymn = true;
        
        // If hymnId is specified in URL, only show that hymn
        const hymnsToDisplay = hymnIdParam 
            ? hymns.filter(h => h.id === hymnIdParam)
            : hymns;
        
        const theNodes = hymnsToDisplay.map((hymn) => {
            alternateHymn = !alternateHymn;

            return <HymnRow
                key={hymn.id}
                hymn={hymn}
                seasonId={props.seasonId}
                serviceId={props.serviceId}
                isAlternate={alternateHymn}
                handleFoundFormat={handleFoundFormat}
                isExpanded={hymnIdParam === hymn.id}
                selectedFormatId={formatIdParam}
            />
        });

        if (theNodes.length === 0) {
            setHymnsNodes([loadingDiv]);
        } else {
            setHymnsNodes(theNodes);
        }
    }, [hymns, hymnIdParam, formatIdParam, loadingDiv, props.serviceId, props.seasonId]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    return (
        <>
            {
                !isMounted.current ? <LoadingSpinner /> :
                    <div style={{ padding: "7px 3px 7px 3px", marginTop: "30px" }}>
                        <div className="contentLinksDiv">
                            {
                                !!serviceFormatLink ?
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto' }}>
                                        <MyNavLink to={serviceFormatLink}><HymnTitle content={props.serviceName} /></MyNavLink>
                                        <FormatOptionsContextMenu title={props.serviceName} formatsMap={serviceFormatsMap} />
                                    </div> : <HymnTitle content={props.serviceName} />
                            }
                            
                        </div>
                        
                        {hymnsNodes}

                        <CrossDivider />
                    </div>
            }
        </>
    );
}

export default ServiceContents;
