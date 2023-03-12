import React, { useContext, useEffect, useState } from "react";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { getServiceNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import ServiceContents from "./ServiceContents";

interface IProps {
    seasonName: string;
    seasonId: string;
}
function ServicesMenu(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [services, setServices] = useState<IServiceInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const servicesResponse = await hymnsDataProvider.getServiceList(props.seasonId);
        setServices(servicesResponse.sort(HymnUtils.serviceInfoComparer));
        setIsLoading(false);
    }, [languageProperties, props.seasonId]);

    useEffect(() => {
        fetchFromBackend();
    }, [fetchFromBackend]);

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !!services ?
                        <div>
                            <BreadCrumb items={[
                                { title: strings.seasons, path: "/Seasons" },
                                { title: props.seasonName }]} />

                            {services.map((service) => {
                                const serviceId = getServiceNumberFromId(service.id);
                                return <ServiceContents key={service.id} seasonId={props.seasonId} serviceId={serviceId} />
                            })}
                        </div>
                        : null
            }
        </>
    );
}

export default ServicesMenu;
