import React, { useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { stringFormat } from "../stringFormat";
import HymnContentFromSeasonService from "./HymnContentFromSeasonService";
import HymnContentFromService from "./HymnContentFromService";
import InvalidAddressMessage from "./InvalidAddressMessage";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import ServicesMenu from "./ServicesMenu";

function SeasonRouter() {
    let { seasonId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        
        // Fetch season from the seasons list (S3 backend)
        const seasons = await hymnsDataProvider.getSeasonList();
        const seasonResponse = seasons.find(s => s.id === seasonIdParam);

        if (isMounted.current) {
            setSeasonInfo(seasonResponse);
            setIsLoading(false);
        }
    }, [seasonIdParam, languageProperties, environmentProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${seasonInfo?.displayName || strings.seasons} - hazzat.com`;
    }, [isLoading, seasonInfo]);

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !!seasonInfo ?
                        <div>
                            <div className="pageTitle">{stringFormat(strings.seasonTitle, seasonInfo.displayName)}</div>

                            <Routes>
                                <Route path="/" element={<ServicesMenu seasonId={seasonIdParam} seasonName={seasonInfo.displayName} seasonVerse={seasonInfo.displayVerse} />} />
                                <Route path={`/services/:serviceId`} element={<ServicesMenu seasonId={seasonIdParam} seasonName={seasonInfo.displayName} seasonVerse={seasonInfo.displayVerse} />} />
                                <Route path={`/services/:serviceId/hymns/:hymnId`} element={<ServicesMenu seasonId={seasonIdParam} seasonName={seasonInfo.displayName} seasonVerse={seasonInfo.displayVerse} />} />
                                <Route path={`/services/:serviceId/hymns/:hymnId/formats/:formatId`} element={<HymnContentFromSeasonService seasonInfo={seasonInfo} />} />
                                <Route path={`/services/:serviceId/formats/:formatId`} element={<HymnContentFromService seasonInfo={seasonInfo} />} />
                            </Routes>
                        </div>
                        : <InvalidAddressMessage />
            }
        </>
    );
}

export default SeasonRouter;
