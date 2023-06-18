import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { StringMap } from "../Types/StringMap";
import { getFormatNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import ContentPageSettingPane from "./ContentPageSettingPane";
import FormatBar from "./FormatBar";
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
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [hymnInfo, setHymnInfo] = useState<IHymnInfo | undefined>();
    const [formatsMap, setFormatsMap] = useState<StringMap<string | undefined>>({});
    const [formatInfo, setFormatInfo] = useState<IFormatInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchVariationsCallback = () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        return hymnsDataProvider.getServiceHymnsFormatVariationList(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
    };

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const servicePromise = hymnsDataProvider.getService(seasonIdParam, serviceIdParam);
        const hymnPromise = hymnsDataProvider.getServiceHymn(seasonIdParam, serviceIdParam, hymnIdParam);
        const formatListPromise = hymnsDataProvider.getServiceHymnFormatList(seasonIdParam, serviceIdParam, hymnIdParam);
        const formatPromise = hymnsDataProvider.getServiceHymnFormat(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
        const [serviceResponse, hymnResponse, formatListResponse, formatResponse] = await Promise.all([servicePromise, hymnPromise, formatListPromise, formatPromise]);

        const resultFormatsMap: StringMap<string | undefined> = {};
        // update formats map
        formatListResponse.forEach((formatInfo) => {
            const formatId = getFormatNumberFromId(formatInfo.id);
            resultFormatsMap[formatId] = formatInfo.id;
        });

        if (isMounted.current) {
            setServiceInfo(serviceResponse);
            setHymnInfo(hymnResponse);
            setFormatsMap(resultFormatsMap);
            setFormatInfo(formatResponse);
            setIsLoading(false);
        }
    }, [seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam, languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${props.seasonInfo.name} - ${serviceInfo?.name}: ${hymnInfo?.name} (${formatInfo?.name}) - hazzat.com`;
    }, [isLoading, props.seasonInfo, serviceInfo?.name, hymnInfo?.name, formatInfo?.name]);

    if (isLoading || !serviceInfo || !hymnInfo || !formatInfo) {
        return (<div />)
    }
    
    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    <div>
                        <BreadCrumb items={[
                            { title: strings.seasons, path: "/Seasons" },
                            { title: props.seasonInfo.name, path: `/Seasons/${seasonIdParam}` },
                            { title: `${serviceInfo.name}: ${hymnInfo.name}` }]} />

                        <FormatBar
                            title={hymnInfo.name}
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
