import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { getHymnNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    seasonInfo: ISeasonInfo;
}

function HymnContentFromService(props: IProps) {
    let { seasonId, serviceId, formatId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const serviceIdParam: string = serviceId || "";
    const formatIdParam: string = formatId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [hymnList, setHymnList] = useState<IHymnInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const servicePromise = hymnsDataProvider.getService(seasonIdParam, serviceIdParam);
        const hymnListPromise = hymnsDataProvider.getServiceHymnList(seasonIdParam, serviceIdParam);
        const [serviceResponse, hymnListResponse] = await Promise.all([servicePromise, hymnListPromise]);

        const hymnListResponseSorted = hymnListResponse.sort(HymnUtils.hymnInfoComparer);
        
        if (isMounted.current) {
            setServiceInfo(serviceResponse);
            setHymnList(hymnListResponseSorted);
            setIsLoading(false);
        }

    }, [seasonIdParam, serviceIdParam, languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        let formatName = "";
        switch (formatIdParam) {
            case "1":
                formatName = strings.textFormatName;
                break;
            case "2":
                formatName = strings.hazzatFormatName;
                break;
            case "3":
                formatName = strings.verticalHazzatFormatName;
                break;
            case "4":
                formatName = strings.musicFormatName;
                break;
            case "5":
                formatName = strings.audioFormatName;
                break;
            case "6":
                formatName = strings.videoFormatName;
                break;
            case "7":
                formatName = strings.informationFormatName;
                break;
        }
        document.title = isLoading ? "hazzat.com" : `${props.seasonInfo.name} - ${serviceInfo?.name} (${formatName}) - hazzat.com`;
    }, [isLoading, props.seasonInfo, serviceInfo?.name, formatIdParam]);

    if (!serviceInfo || !hymnList) {
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
                            { title: `${serviceInfo.name}` }]} />

                        {hymnList.map((hymn) => {

                            const variationsCallback = () => {
                                const hymnId = getHymnNumberFromId(hymn.id);
                                const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
                                return hymnsDataProvider.getServiceHymnsFormatVariationList(seasonIdParam, serviceIdParam, hymnId, formatIdParam);
                            };

                            return <Content formatId={formatIdParam} variationsCallback={variationsCallback} />
                        })}
                    </div>
            }
        </>
    );
}

export default HymnContentFromService;
