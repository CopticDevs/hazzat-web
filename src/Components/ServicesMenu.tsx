import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
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
    seasonVerse: string;
}
function ServicesMenu(props: IProps) {
    const getLoadingSpinnerDiv = () => {
        return <div key="loading"><LoadingSpinner /></div>;
    };

    const loadingDiv = useMemo(() => getLoadingSpinnerDiv(), []);
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [services, setServices] = useState<IServiceInfo[]>([]);
    const [servicesNodes, setServicesNodes] = useState<React.ReactNode[]>([loadingDiv]);
    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl);
        const servicesResponse = await hymnsDataProvider.getServiceList(props.seasonId);

        if (isMounted.current) {
            setServices(servicesResponse.sort(HymnUtils.serviceInfoComparer));
        }
    }, [languageProperties, environmentProperties, props.seasonId, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        const theNodes = services.map((service) => {
            const serviceId = getServiceNumberFromId(service.id);
            return <ServiceContents key={service.id} seasonId={props.seasonId} serviceId={serviceId} serviceName={service.name} />
        });

        if (theNodes.length === 0) {
            setServicesNodes([loadingDiv]);
        } else {
            setServicesNodes(theNodes);
        }
    }, [services, loadingDiv, props.seasonId]);

    if (!isMounted.current) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {
                !!services ?
                    <div>
                        <div>
                            <div className="seasonVerse" dangerouslySetInnerHTML={{ __html: props.seasonVerse }} />
                        </div>
                        <BreadCrumb items={[
                            { title: strings.seasons, path: "/Seasons" },
                            { title: props.seasonName }]} />

                        {servicesNodes}
                    </div>
                    : null
            }
        </>
    );
}

export default ServicesMenu;
