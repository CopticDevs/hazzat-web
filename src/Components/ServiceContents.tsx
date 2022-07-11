import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import HymnRow from "./HymnRow";
import HymnTitle from "./HymnTitle";

interface IProps {
    seasonId: string;
    serviceId: string;
}

function ServiceContents(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [serviceInfo, setServiceInfo] = useState<IServiceInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchService = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const serviceResponse = await hymnsDataProvider.getService(props.seasonId, props.serviceId);
        setServiceInfo(serviceResponse);
    }, [languageProperties, props.seasonId, props.serviceId]);

    useEffect(() => {
        setIsLoading(true);
        fetchService();
        setIsLoading(false);
    }, [fetchService]);

    if (isLoading || !serviceInfo) {
        return (<div/>)
    }

    return (
        <div style={{ padding: "7px 3px 7px 3px" }}>
            <HymnTitle content={serviceInfo.name} />
            <div className="clear" />
            <HymnRow title="hymns will go here" />
        </div>
    );
}

export default ServiceContents;
