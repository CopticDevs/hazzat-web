import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfoWithServiceDetails } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { ITypeInfo } from "../Providers/HymnsDataProvider/Models/ITypeInfo";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    typeInfo: ITypeInfo;
}

function HymnContentFromType(props: IProps) {
    let { typeId, seasonId, hymnId, formatId } = useParams();
    const typeIdParam: string = typeId || "";
    const seasonIdParam: string = seasonId || "";
    const hymnIdParam: string = hymnId || "";
    const formatIdParam: string = formatId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [hymnInfo, setHymnInfo] = useState<IHymnInfoWithServiceDetails | undefined>();
    const [formatInfo, setFormatInfo] = useState<IFormatInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchVariationsCallback = () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        return hymnsDataProvider.getTypeSeasonServiceHymnFormatVariationList(typeIdParam, seasonIdParam, hymnIdParam, formatIdParam);
    };

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonPromise = hymnsDataProvider.getTypeSeason(typeIdParam, seasonIdParam);
        const hymnPromise = hymnsDataProvider.getTypeSeasonServiceHymn(typeIdParam, seasonIdParam, hymnIdParam);
        const formatPromise = hymnsDataProvider.getTypeSeasonServiceHymnFormat(typeIdParam, seasonIdParam, hymnIdParam, formatIdParam);
        
        const [seasonResponse, hymnResponse, formatResponse] = await Promise.all([seasonPromise, hymnPromise, formatPromise]);

        if (isMounted.current) {
            setSeasonInfo(seasonResponse);
            setHymnInfo(hymnResponse);
            setFormatInfo(formatResponse);
            setIsLoading(false);
        }
    }, [seasonIdParam, typeIdParam, hymnIdParam, formatIdParam, languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${props.typeInfo.name} - ${hymnInfo?.serviceName}: ${hymnInfo?.name} (${formatInfo?.name}) - hazzat.com`;
    }, [isLoading, props.typeInfo, seasonInfo?.name, hymnInfo?.serviceName, hymnInfo?.name, formatInfo?.name]);

    if (isLoading || !seasonInfo || !hymnInfo || !formatInfo) {
        return (<div />)
    }
    
    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    <div>
                        <BreadCrumb items={[
                            { title: strings.types, path: "/Types" },
                            { title: props.typeInfo.name, path: `/Types/${typeIdParam}` },
                            { title: `${hymnInfo.serviceName}: ${hymnInfo.name}` }]} />

                        <Content formatId={formatIdParam} variationsCallback={fetchVariationsCallback} />
                    </div>
            }
        </>
    );
}

export default HymnContentFromType;
