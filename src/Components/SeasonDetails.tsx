import React, { useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { stringFormat } from "../stringFormat";
import Content from "./Content";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import ServicesMenu from "./ServicesMenu";

function SeasonDetails() {
    let { seasonId } = useParams();
    const seasonIdParam: string = seasonId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonResponse = await hymnsDataProvider.getSeason(seasonIdParam);

        if (isMounted.current) {
            setSeasonInfo(seasonResponse);
            setIsLoading(false);
        }
    }, [seasonIdParam, languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${seasonInfo?.name} - hazzat.com`;
    }, [isLoading, seasonInfo]);

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !!seasonInfo ?
                        <div>
                            <div className="pageTitle">{stringFormat(strings.seasonTitle, seasonInfo.name)}</div>
                            <div className="seasonVerse" dangerouslySetInnerHTML={{ __html: seasonInfo.verse }} />

                            <Routes>
                                <Route path="/" element={<ServicesMenu seasonId={seasonIdParam} seasonName={seasonInfo.name} />} />
                                <Route path={`/Services/:serviceId/hymns/:hymnId/formats/:formatId`} element={<Content />} />
                            </Routes>
                        </div>
                        : null
            }
        </>
    );
}

export default SeasonDetails;
