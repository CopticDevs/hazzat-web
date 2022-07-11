import React, { useContext, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { stringFormat } from "../stringFormat";
import { getServiceNumberFromId } from "../Utils/ParserUtils";
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

    const fetchSeason = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonResponse = await hymnsDataProvider.getSeason(seasonIdParam);
        setSeasonInfo(seasonResponse);
    }, [seasonIdParam, languageProperties]);

    const fetchServices = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const servicesResponse = await hymnsDataProvider.getServiceList(seasonIdParam);
        setServices(servicesResponse);
    }, [seasonIdParam, languageProperties]);

    useEffect(() => {
        setIsLoading(true);
        fetchSeason();
        fetchServices();
        setIsLoading(false);
    }, [fetchSeason, fetchServices]);

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
                            <div className="breadcrumbDiv"><NavLink to="/Seasons" className="breadcrumbLink"><LocalizedMessage of="seasons" /></NavLink> &gt; {seasonInfo.name}</div>

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
