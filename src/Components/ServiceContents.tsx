import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { StringMap } from "../Types/StringMap";
import { getFormatNumberFromId, getHymnNumberFromId } from "../Utils/ParserUtils";
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
    const getLoadingSpinnerDiv = () => {
        return <div key="loading"><LoadingSpinner /></div>;
    };

    const loadingDiv = useMemo(() => getLoadingSpinnerDiv(), []);
    const { languageProperties } = useContext(LanguageContext);
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
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const hymnsResponse = await hymnsDataProvider.getServiceHymnList(props.seasonId, props.serviceId);

        if (isMounted.current) {
            setHymnsInfo(hymnsResponse.sort(HymnUtils.hymnInfoComparer));
        }
    }, [languageProperties, props.seasonId, props.serviceId, isMounted]);

    useEffect(() => {
        let alternateHymn = true;
        const theNodes = hymns.map((hymn) => {
            alternateHymn = !alternateHymn;
            const hymnId = getHymnNumberFromId(hymn.id);

            const getFormatsCallback = () => {
                const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
                return hymnsDataProvider.getServiceHymnFormatList(props.seasonId, props.serviceId, hymnId);
            };

            return <HymnRow
                key={hymn.id}
                hymnName={hymn.name}
                isAlternate={alternateHymn}
                getFormatsCallback={getFormatsCallback}
                parseFormatIdCallback={getFormatNumberFromId}
                handleFoundFormat={handleFoundFormat}
            />
        });

        if (theNodes.length === 0) {
            setHymnsNodes([loadingDiv]);
        } else {
            setHymnsNodes(theNodes);
        }
    }, [hymns, loadingDiv, languageProperties.localeName, props.serviceId, props.seasonId]);

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
