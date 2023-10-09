import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfoWithServiceDetails } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { ITuneInfo } from "../Providers/HymnsDataProvider/Models/ITuneInfo";
import { StringMap } from "../Types/StringMap";
import { getTuneSeasonHymnFormatNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import ContentPageSettingPane from "./ContentPageSettingPane";
import FormatBar from "./FormatBar";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    tuneInfo: ITuneInfo;
}

function HymnContentFromTune(props: IProps) {
    let { tuneId, seasonId, hymnId, formatId } = useParams();
    const tuneIdParam: string = tuneId || "";
    const seasonIdParam: string = seasonId || "";
    const hymnIdParam: string = hymnId || "";
    const formatIdParam: string = formatId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [hymnInfo, setHymnInfo] = useState<IHymnInfoWithServiceDetails | undefined>();
    const [formatsMap, setFormatsMap] = useState<StringMap<string | undefined>>({});
    const [formatInfo, setFormatInfo] = useState<IFormatInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchVariationsCallback = () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        return hymnsDataProvider.getTuneSeasonServiceHymnFormatVariationList(tuneIdParam, seasonIdParam, hymnIdParam, formatIdParam);
    };

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonPromise = hymnsDataProvider.getTuneSeason(tuneIdParam, seasonIdParam);
        const hymnPromise = hymnsDataProvider.getTuneSeasonServiceHymn(tuneIdParam, seasonIdParam, hymnIdParam);
        const formatListPromise = hymnsDataProvider.getTuneSeasonServiceHymnFormatList(tuneIdParam, seasonIdParam, hymnIdParam);
        const formatPromise = hymnsDataProvider.getTuneSeasonServiceHymnFormat(tuneIdParam, seasonIdParam, hymnIdParam, formatIdParam);
        
        const [seasonResponse, hymnResponse, formatListResponse, formatResponse] = await Promise.all([seasonPromise, hymnPromise, formatListPromise, formatPromise]);

        const resultFormatsMap: StringMap<string | undefined> = {};
        // update formats map
        formatListResponse.forEach((formatInfo) => {
            const formatId = getTuneSeasonHymnFormatNumberFromId(formatInfo.id);
            resultFormatsMap[formatId] = formatInfo.id;
        });

        if (isMounted.current) {
            setSeasonInfo(seasonResponse);
            setHymnInfo(hymnResponse);
            setFormatsMap(resultFormatsMap);
            setFormatInfo(formatResponse);
            setIsLoading(false);
        }
    }, [seasonIdParam, tuneIdParam, hymnIdParam, formatIdParam, languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${props.tuneInfo.name} - ${hymnInfo?.serviceName}: ${hymnInfo?.name} (${formatInfo?.name}) - hazzat.com`;
    }, [isLoading, props.tuneInfo, seasonInfo?.name, hymnInfo?.serviceName, hymnInfo?.name, formatInfo?.name]);

    if (isLoading || !seasonInfo || !hymnInfo || !formatInfo) {
        return (<div />)
    }
    
    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    <div>
                        <BreadCrumb items={[
                            { title: strings.tunes, path: "/Tunes" },
                            { title: props.tuneInfo.name, path: `/Tunes/${tuneIdParam}` },
                            { title: `${hymnInfo.serviceName}: ${hymnInfo.name}` }]} />

                        <FormatBar
                            title={props.tuneInfo.name}
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

export default HymnContentFromTune;
