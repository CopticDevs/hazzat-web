import MyNavLink from "./MyNavLink";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import BreadCrumb from "./BreadCrumb";
import LoadingSpinner from "./LoadingSpinner";
import ContentLoadError from "./ContentLoadError";
import "./SeasonDetails.css";
import ServiceContents from "./ServiceContents";

interface IProps {
    seasonName: string;
    seasonId: string;
}
function ServicesMenu(props: IProps) {
    // Get serviceId from URL if present
    const { serviceId: serviceIdParam } = useParams();
    
    const getLoadingSpinnerDiv = () => {
        return <div key="loading"><LoadingSpinner /></div>;
    };

    const loadingDiv = useMemo(() => getLoadingSpinnerDiv(), []);
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState<IServiceInfo[]>([]);
    const [servicesNodes, setServicesNodes] = useState<React.ReactNode[]>([loadingDiv]);
    const isMounted = useRef(true);
    const requestId = useRef(0);
    const [loadFailed, setLoadFailed] = useState(false);

    const fetchFromBackend = React.useCallback(async () => {
        const request = ++requestId.current;
        const current = () => isMounted.current && request === requestId.current;
        setIsLoading(true);
        setLoadFailed(false);
        try {
            const provider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
            const response = await provider.getServiceSummaryList(props.seasonId);
            if (current()) setServices([...response].sort(HymnUtils.serviceInfoComparer));
        } catch {
            if (current()) setLoadFailed(true);
        } finally {
            if (current()) setIsLoading(false);
        }
    }, [languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl, props.seasonId]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        // If serviceId is specified in URL, only render that service
        const servicesToRender = serviceIdParam 
            ? services.filter(s => s.id === serviceIdParam)
            : services;
            
        const theNodes = servicesToRender.map((service) => {
            return <ServiceContents key={service.id} seasonId={props.seasonId} serviceId={service.id} serviceName={service.displayName} />
        });

        setServicesNodes(theNodes);
    }, [services, serviceIdParam, loadingDiv, props.seasonId]);

    if (loadFailed) return <ContentLoadError retry={fetchFromBackend} />;
    if (isLoading || !isMounted.current) {
        return <LoadingSpinner />;
    }

    return (
        <>
            {
                !!services ?
                    <div>
                        <div className="seasonDownloadActions">
                            <MyNavLink className="seasonDownloadPdfsButton" to={`/Booklets/${props.seasonId}`}>
                                {strings.downloadPdfs}
                            </MyNavLink>
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
