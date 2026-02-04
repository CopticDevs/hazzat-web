import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
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

function HymnContentFromSeasonService(props: IProps) {
    let { seasonId, serviceId, hymnId, formatId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const serviceIdParam: string = serviceId || "";
    const hymnIdParam: string = hymnId || "";
    const formatIdParam: string = formatId || "";
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [hymnInfo, setHymnInfo] = useState<IHymnInfo | undefined>();
    const [formatsMap, setFormatsMap] = useState<StringMap<string | undefined>>({});
    const [formatInfo, setFormatInfo] = useState<IFormatInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchVariationsCallback = () => {
        // Find the hymn and format from embedded data
        const hymn = serviceInfo?.hymns?.find(h => h.id === hymnIdParam);
        const format = hymn?.formats?.find(f => f.id === formatIdParam);
        
        return Promise.resolve(format?.variations || []);
    };

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        
        // Fetch service with embedded hymns from S3
        const serviceResponse = await hymnsDataProvider.getService(seasonIdParam, serviceIdParam);

        if (isMounted.current && serviceResponse) {
            setServiceInfo(serviceResponse);
            
            // Find the specific hymn and format from embedded data
            const hymn = serviceResponse.hymns?.find(h => h.id === hymnIdParam);
            const formatList = hymn?.formats || [];
            const format = formatList.find(f => f.id === formatIdParam);
            
            const resultFormatsMap: StringMap<string | undefined> = {};
            // update formats map with full URLs
            formatList.forEach((formatInfo) => {
                const formatId = formatInfo.id;
                resultFormatsMap[formatId] = `/seasons/${seasonIdParam}/services/${serviceIdParam}/hymns/${hymnIdParam}/formats/${formatId}`;
            });

            setHymnInfo(hymn);
            setFormatsMap(resultFormatsMap);
            setFormatInfo(format);
            setIsLoading(false);
        }
    }, [seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam, languageProperties, environmentProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading || !serviceInfo ? "hazzat.com" : `${props.seasonInfo.displayName} - ${serviceInfo.displayName}: ${hymnInfo?.displayName || ''} (${formatInfo?.name || ''}) - hazzat.com`;
    }, [isLoading, props.seasonInfo, serviceInfo, hymnInfo, formatInfo]);

    if (isLoading) {
        return (<LoadingSpinner />);
    }

    if (!serviceInfo || !formatInfo) {
        return (<InvalidAddressMessage />);
    }

    if (!serviceInfo || !hymnInfo || !formatInfo) {
        return (<div />)
    }
    
    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    <div>
                        <BreadCrumb items={[
                            { title: strings.seasons, path: "/Seasons" },
                            { title: props.seasonInfo.displayName, path: `/Seasons/${seasonIdParam}` },
                            { title: `${serviceInfo.displayName}: ${hymnInfo.displayName}` }]} />

                        <FormatBar
                            title={hymnInfo.displayName}
                            formatsMap={formatsMap}
                            activeFormatId={formatIdParam}
                            />

                        <Content formatId={formatIdParam} variationsCallback={fetchVariationsCallback} />
                        <ContentPageSettingPane />
                    </div>
            }
        </>
    );
}

export default HymnContentFromSeasonService;
