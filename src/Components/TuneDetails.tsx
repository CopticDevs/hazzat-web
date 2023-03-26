import React, { useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ITuneInfo } from "../Providers/HymnsDataProvider/Models/ITuneInfo";
import HymnContentFromTune from "./HymnContentFromTune";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import TuneSeasonsMenu from "./TuneSeasonsMenu";

function TuneDetails() {
    let { tuneId } = useParams();
    const tuneIdParam: string = tuneId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [tuneInfo, setTuneInfo] = useState<ITuneInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const tuneResponse = await hymnsDataProvider.getTune(tuneIdParam);

        if (isMounted.current) {
            setTuneInfo(tuneResponse);
            setIsLoading(false);
        }
    }, [tuneIdParam, languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${tuneInfo?.name} - hazzat.com`;
    }, [isLoading, tuneInfo]);

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !!tuneInfo ?
                        <div>
                            <div className="pageTitle">{tuneInfo.name}</div>

                            <Routes>
                                <Route path="/" element={<TuneSeasonsMenu tuneId={tuneIdParam} tuneName={tuneInfo.name} />} />
                                <Route path={`/seasons/:seasonId/hymns/:hymnId/formats/:formatId`} element={<HymnContentFromTune tuneInfo={tuneInfo} />} />
                            </Routes>
                        </div>
                        : null
            }
        </>
    );
}

export default TuneDetails;
