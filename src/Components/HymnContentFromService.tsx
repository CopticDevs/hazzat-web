import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { StringMap } from "../Types/StringMap";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import ContentPageSettingPane from "./ContentPageSettingPane";
import FormatBar from "./FormatBar";
import InvalidAddressMessage from "./InvalidAddressMessage";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    seasonInfo: ISeasonInfo;
}

function HymnContentFromService(props: IProps) {
    let { seasonId, serviceId, hymnId, formatId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const serviceIdParam: string = serviceId || "";
    const hymnIdParam: string | undefined = hymnId;
    const formatIdParam: string = formatId || "";
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [formatName, setformatName] = useState<string | undefined>("");
    const [hymnList, setHymnList] = useState<IHymnInfo[]>([]);
    const [hasText, setHasText] = useState<boolean>(false);
    const [hasHazzat, setHasHazzat] = useState<boolean>(false);
    const [hasVerticalHazzat, setHasVerticalHazzat] = useState<boolean>(false);
    const [hasMusicalNotes, setHasMusicalNotes] = useState<boolean>(false);
    const [hasAudio, setHasAudio] = useState<boolean>(false);
    const [hasVideo, setHasVideo] = useState<boolean>(false);
    const [hasInformation, setHasInformation] = useState<boolean>(false);
    const [serviceFormatsMap, setServiceFormatsMap] = useState<StringMap<string | undefined>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const handleFoundFormat = (fullFormatId: string) => {
        const formatId = fullFormatId;
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

        resultMap["1"] = hasText ? `/seasons/${seasonIdParam}/services/${serviceIdParam}/formats/1` : undefined;
        resultMap["2"] = hasHazzat ? `/seasons/${seasonIdParam}/services/${serviceIdParam}/formats/2` : undefined;
        resultMap["3"] = hasVerticalHazzat ? `/seasons/${seasonIdParam}/services/${serviceIdParam}/formats/3` : undefined;
        resultMap["4"] = hasMusicalNotes ? `/seasons/${seasonIdParam}/services/${serviceIdParam}/formats/4` : undefined;
        resultMap["5"] = hasAudio ? `/seasons/${seasonIdParam}/services/${serviceIdParam}/formats/5` : undefined;
        resultMap["6"] = hasVideo ? `/seasons/${seasonIdParam}/services/${serviceIdParam}/formats/6` : undefined;
        resultMap["7"] = hasInformation ? `/seasons/${seasonIdParam}/services/${serviceIdParam}/formats/7` : undefined;

        setServiceFormatsMap(resultMap);
    }, [seasonIdParam, serviceIdParam, hasText, hasHazzat, hasVerticalHazzat, hasMusicalNotes, hasAudio, hasVideo, hasInformation, setServiceFormatsMap]);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        
        // Fetch service with embedded hymns from S3
        const serviceResponse = await hymnsDataProvider.getService(seasonIdParam, serviceIdParam);

        if (isMounted.current && serviceResponse) {
            setServiceInfo(serviceResponse);
            
            // Extract hymns from embedded service data
            const embeddedHymns = serviceResponse.hymns || [];
            const hymnListResponseSorted = embeddedHymns.sort(HymnUtils.hymnInfoComparer);
            
            setHymnList(hymnListResponseSorted);
            
            // Scan all hymns to find available formats
            const availableFormats = new Set<string>();
            hymnListResponseSorted.forEach(hymn => {
                hymn.formats?.forEach(format => {
                    availableFormats.add(format.id);
                });
            });
            
            // Update format flags
            availableFormats.forEach(formatId => {
                handleFoundFormat(formatId);
            });
            
            setIsLoading(false);
        }

    }, [seasonIdParam, serviceIdParam, languageProperties, environmentProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        let formatNameTmp = undefined;
        switch (formatIdParam) {
            case "1":
                formatNameTmp = strings.textFormatName;
                break;
            case "2":
                formatNameTmp = strings.hazzatFormatName;
                break;
            case "3":
                formatNameTmp = strings.verticalHazzatFormatName;
                break;
            case "4":
                formatNameTmp = strings.musicFormatName;
                break;
            case "5":
                formatNameTmp = strings.audioFormatName;
                break;
            case "6":
                formatNameTmp = strings.videoFormatName;
                break;
            case "7":
                formatNameTmp = strings.informationFormatName;
                break;
        }

        setformatName(formatNameTmp);
        
        document.title = isLoading || !serviceInfo ? "hazzat.com" : `${props.seasonInfo.displayName} - ${serviceInfo.displayName} (${formatName}) - hazzat.com`;
    }, [isLoading, props.seasonInfo, serviceInfo, formatIdParam, formatName]);

    if (isLoading) {
        return (<LoadingSpinner />);
    }

    if (!serviceInfo || formatName === undefined) {
        return (<InvalidAddressMessage />);
    }
    if (!hymnList) {
        return (<div />);
    }

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    <div>
                        <BreadCrumb items={[
                            { title: strings.seasons, path: "/Seasons" },
                            { title: props.seasonInfo.displayName, path: `/Seasons/${seasonIdParam}` },
                            { title: serviceInfo.displayName }]} />

                        <FormatBar
                            title={serviceInfo.displayName}
                            formatsMap={serviceFormatsMap}
                            activeFormatId={formatIdParam}
                        />

                        {hymnList
                            .filter(hymn => !hymnIdParam || hymn.id === hymnIdParam)
                            .map((hymn) => {
                                const format = hymn.formats?.find(f => f.id === formatIdParam);
                                
                                if (!format) {
                                    return null;
                                }

                                const variationsCallback = async () => {
                                    return format.variations || [];
                                };

                                return <Content
                                    key={hymn.id}
                                    formatId={formatIdParam}
                                    variationsCallback={variationsCallback}
                                />
                            })}
                        <ContentPageSettingPane />
                    </div>
            }
        </>
    );
}

export default HymnContentFromService;
