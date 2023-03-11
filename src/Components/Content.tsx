import React from "react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import { stringFormat } from "../stringFormat";
import BreadCrumb from "./BreadCrumb";
import HazzatContent from "./HazzatContent";
import MainPaper, { Size } from "./MainPaper";

function Content() {
    let { seasonId, serviceId, hymnId, formatId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const serviceIdParam: string = serviceId || "";
    const hymnIdParam: string = hymnId || "";
    const formatIdParam: string = formatId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [hymnInfo, setHymnInfo] = useState<IHymnInfo | undefined>();
    const [variations, setVariations] = useState<IVariationInfo<any>[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonPromise = hymnsDataProvider.getSeason(seasonIdParam);
        const servicePromise = hymnsDataProvider.getService(seasonIdParam, serviceIdParam);
        const hymnPromise = hymnsDataProvider.getServiceHymn(seasonIdParam, serviceIdParam, hymnIdParam);
        const variationsPromise = hymnsDataProvider.getServiceHymnsFormatVariationList(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
        const [seasonResponse, serviceResponse, hymnResponse, variationsResponse] = await Promise.all([seasonPromise, servicePromise, hymnPromise, variationsPromise]);
        setSeasonInfo(seasonResponse);
        setServiceInfo(serviceResponse);
        setHymnInfo(hymnResponse);
        setVariations(variationsResponse);
    }, [seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam, languageProperties]);

    useEffect(() => {
        setIsLoading(true);
        fetchFromBackend();
        setIsLoading(false);
    }, [fetchFromBackend]);

    if (isLoading || !seasonInfo || !serviceInfo || !hymnInfo || !variations) {
        return (<div />)
    }
    
    return (
        <MainPaper size={Size.Wide}>
            {
                isLoading ? <div><LocalizedMessage of="loading" /></div> :
                    !!seasonInfo ?
                        <div>
                            <div className="pageTitle">{stringFormat(strings.seasonTitle, seasonInfo.name)}</div>
                            <div className="seasonVerse" dangerouslySetInnerHTML={{ __html: seasonInfo.verse }} />
                            <BreadCrumb items={[
                                { title: strings.seasons, path: "/Seasons" },
                                { title: seasonInfo.name, path: `/Seasons/${seasonIdParam}` },
                                { title: `${serviceInfo.name}: ${hymnInfo.name}` }]} />

                            <HazzatContent formatId={formatIdParam} variations={variations} />
                        </div>
                        : null
            }
        </MainPaper>
    );
}

export default Content;
