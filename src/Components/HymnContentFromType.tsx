import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfoWithServiceDetails } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { ITypeInfo } from "../Providers/HymnsDataProvider/Models/ITypeInfo";
import { StringMap } from "../Types/StringMap";
import { getTypeSeasonHymnFormatNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import ContentPageSettingPane from "./ContentPageSettingPane";
import FormatBar from "./FormatBar";
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
    const { environmentProperties } = useContext(EnvironmentContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [hymnInfo, setHymnInfo] = useState<IHymnInfoWithServiceDetails | undefined>();
    const [formatsMap, setFormatsMap] = useState<StringMap<string | undefined>>({});
    const [formatInfo, setFormatInfo] = useState<IFormatInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchVariationsCallback = () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl);
        return hymnsDataProvider.getTypeSeasonServiceHymnFormatVariationList(typeIdParam, seasonIdParam, hymnIdParam, formatIdParam);
    };

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl);
        const seasonPromise = hymnsDataProvider.getTypeSeason(typeIdParam, seasonIdParam);
        const hymnPromise = hymnsDataProvider.getTypeSeasonServiceHymn(typeIdParam, seasonIdParam, hymnIdParam);
        const formatListPromise = hymnsDataProvider.getTypeSeasonServiceHymnFormatList(typeIdParam, seasonIdParam, hymnIdParam);
        const formatPromise = hymnsDataProvider.getTypeSeasonServiceHymnFormat(typeIdParam, seasonIdParam, hymnIdParam, formatIdParam);
        
        const [seasonResponse, hymnResponse, formatListResponse, formatResponse] = await Promise.all([seasonPromise, hymnPromise, formatListPromise, formatPromise]);

        const resultFormatsMap: StringMap<string | undefined> = {};
        // update formats map
        formatListResponse.forEach((formatInfo) => {
            const formatId = getTypeSeasonHymnFormatNumberFromId(formatInfo.id);
            resultFormatsMap[formatId] = formatInfo.id;
        });

        if (isMounted.current) {
            setSeasonInfo(seasonResponse);
            setHymnInfo(hymnResponse);
            setFormatsMap(resultFormatsMap);
            setFormatInfo(formatResponse);
            setIsLoading(false);
        }
    }, [seasonIdParam, typeIdParam, hymnIdParam, formatIdParam, languageProperties, environmentProperties, isMounted]);

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

                        <FormatBar
                            title={props.typeInfo.name}
                            formatsMap={formatsMap}
                            activeFormatId={formatIdParam}
                        />

                        <Content formatId={formatIdParam} variationsCallback={fetchVariationsCallback} />
                        <ContentPageSettingPane />
                    </div>
            }
        </>
    );
}

export default HymnContentFromType;
