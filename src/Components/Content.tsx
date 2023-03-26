import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import BreadCrumb from "./BreadCrumb";
import ContentAudio from "./ContentAudio";
import ContentHazzat from "./ContentHazzat";
import ContentInformation from "./ContentInformation";
import ContentMusicalNotes from "./ContentMusicalNotes";
import ContentText from "./ContentText";
import ContentVerticalHazzat from "./ContentVerticalHazzat";
import ContentVideo from "./ContentVideo";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

interface IProps {
    seasonInfo: ISeasonInfo;
}

function Content(props: IProps) {
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
        const variationsPromise = hymnsDataProvider.getServiceHymnsFormatVariationList(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
        const formatPromise = hymnsDataProvider.getServiceHymnFormat(seasonIdParam, serviceIdParam, hymnIdParam, formatIdParam);
        const [serviceResponse, hymnResponse, variationsResponse, formatResponse] = await Promise.all([servicePromise, hymnPromise, variationsPromise, formatPromise]);

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

    let contentControl: JSX.Element;

    switch (formatIdParam) {
        case "1":
            contentControl = <ContentText formatId={formatIdParam} variations={variations} />;
            break;
        case "2":
            contentControl = <ContentHazzat formatId={formatIdParam} variations={variations} />;
            break;
        case "3":
            contentControl = <ContentVerticalHazzat formatId={formatIdParam} variations={variations} />;
            break;
        case "4":
            contentControl = <ContentMusicalNotes formatId={formatIdParam} variations={variations} />;
            break;
        case "5":
            contentControl = <ContentAudio formatId={formatIdParam} variations={variations} />;
            break;
        case "6":
            contentControl = <ContentVideo formatId={formatIdParam} variations={variations} />;
            break;
        case "7":
            contentControl = <ContentInformation formatId={formatIdParam} variations={variations} />;
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
                    <div>
                        <BreadCrumb items={[
                            { title: strings.seasons, path: "/Seasons" },
                            { title: props.seasonInfo.name, path: `/Seasons/${seasonIdParam}` },
                            { title: `${serviceInfo.name}: ${hymnInfo.name}` }]} />

                        {contentControl}
                    </div>
            }
        </>
    );
}

export default Content;
