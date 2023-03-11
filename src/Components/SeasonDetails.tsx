import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { stringFormat } from "../stringFormat";
import { getServiceNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import MainPaper, { Size } from "./MainPaper";
import "./SeasonDetails.css";
import ServiceContents from "./ServiceContents";

function SeasonDetails() {
    let { seasonId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [services, setServices] = useState<IServiceInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonPromise = hymnsDataProvider.getSeason(seasonIdParam);
        const servicesPromise = hymnsDataProvider.getServiceList(seasonIdParam);
        const [seasonResponse, servicesResponse] = await Promise.all([seasonPromise, servicesPromise]);
        setSeasonInfo(seasonResponse);
        setServices(servicesResponse.sort(HymnUtils.serviceInfoComparer));
    }, [seasonIdParam, languageProperties]);

    useEffect(() => {
        setIsLoading(true);
        fetchFromBackend();
        setIsLoading(false);
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${seasonInfo?.name} - hazzat.com`;
    }, [isLoading, seasonInfo]);

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
                                { title: seasonInfo.name }]} />

                            {services.map((service) => {
                                const serviceId = getServiceNumberFromId(service.id);
                                return <ServiceContents key={service.id} seasonId={seasonIdParam} serviceId={serviceId} />
                            })}
                        </div>
                        : null
            }
        </MainPaper>
    );
}

export default SeasonDetails;
