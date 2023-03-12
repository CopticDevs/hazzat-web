import React, { useContext, useEffect, useRef, useState } from "react";
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
import BreadCrumb from "./BreadCrumb";
import ContentHazzat from "./ContentHazzat";
import ContentVerticalHazzat from "./ContentVerticalHazzat";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

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

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonPromise = hymnsDataProvider.getSeason(seasonIdParam);
        const servicePromise = hymnsDataProvider.getService(seasonIdParam, serviceIdParam);
        const hymnPromise = hymnsDataProvider.getServiceHymn(seasonIdParam, serviceIdParam, hymnIdParam);
        const variationsPromise = hymnsDataProvider.getServiceHymnsFormatVariationList(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
        const [seasonResponse, serviceResponse, hymnResponse, variationsResponse] = await Promise.all([seasonPromise, servicePromise, hymnPromise, variationsPromise]);

        if (isMounted.current) {
            setSeasonInfo(seasonResponse);
            setServiceInfo(serviceResponse);
            setHymnInfo(hymnResponse);
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

    if (isLoading || !seasonInfo || !serviceInfo || !hymnInfo || !variations) {
        return (<div />)
    }

    let contentControl: JSX.Element;

    switch (formatIdParam) {
        case "2":
            contentControl = <ContentHazzat formatId={formatIdParam} variations={variations} />;
            break;
        case "3":
            contentControl = <ContentVerticalHazzat formatId={formatIdParam} variations={variations} />;
            break;
        default:
            contentControl = <>
                <div style={{ textAlign: "center", paddingTop: "30px", paddingBottom: "30px" }}>
                    <LocalizedMessage of="contentNotFoundMessage" /><br /><br />
                    <MyNavLink to="#" onClick={() => window.history.back()}>
                        <LocalizedMessage of="goBack" />
                    </MyNavLink>
                </div>
            </>
    }
    
    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !!seasonInfo ?
                        <div>
                            <BreadCrumb items={[
                                { title: strings.seasons, path: "/Seasons" },
                                { title: seasonInfo.name, path: `/Seasons/${seasonIdParam}` },
                                { title: `${serviceInfo.name}: ${hymnInfo.name}` }]} />

                            {contentControl}
                        </div>
                        : null
            }
        </>
    );
}

export default Content;
