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
import { IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    seasonInfo: ISeasonInfo;
}

function HymnContentFromSeason(props: IProps) {
    let { seasonId, serviceId, hymnId, formatId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const serviceIdParam: string = serviceId || "";
    const hymnIdParam: string = hymnId || "";
    const formatIdParam: string = formatId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [hymnInfo, setHymnInfo] = useState<IHymnInfo | undefined>();
    const [formatInfo, setFormatInfo] = useState<IFormatInfo | undefined>();
    const [variations, setVariations] = useState<IVariationInfo<any>[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const servicePromise = hymnsDataProvider.getService(seasonIdParam, serviceIdParam);
        const hymnPromise = hymnsDataProvider.getServiceHymn(seasonIdParam, serviceIdParam, hymnIdParam);
        const formatPromise = hymnsDataProvider.getServiceHymnFormat(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
        const variationsPromise = hymnsDataProvider.getServiceHymnsFormatVariationList(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
        const [serviceResponse, hymnResponse, formatResponse, variationsResponse] = await Promise.all([servicePromise, hymnPromise, formatPromise, variationsPromise]);

        if (isMounted.current) {
            setServiceInfo(serviceResponse);
            setHymnInfo(hymnResponse);
            setFormatInfo(formatResponse);
            setVariations(variationsResponse);
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

    if (isLoading || !serviceInfo || !hymnInfo || !formatInfo || !variations) {
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

                        <Content formatId={formatIdParam} variations={variations} />
                    </div>
            }
        </>
    );
}

export default HymnContentFromSeason;
