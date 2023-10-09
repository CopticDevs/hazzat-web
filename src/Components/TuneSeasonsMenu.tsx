import React, { useContext, useEffect, useRef, useState } from "react";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { getTuneSeasonNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import TuneSeasonsContents from "./TuneSeasonContents";

interface IProps {
    tuneName: string;
    tuneId: string;
}
function TuneSeasonsMenu(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [seasons, setSeasons] = useState<ISeasonInfo[]>([]);
    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonsResponse = await hymnsDataProvider.getTuneSeasonList(props.tuneId);

        if (isMounted.current) {
            setSeasons(seasonsResponse.sort(HymnUtils.seasonInfoComparer));
        }
    }, [languageProperties, props.tuneId, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    return (
        <>
            {
                !isMounted.current ? <LoadingSpinner /> :
                    !!seasons ?
                        <div>
                            <BreadCrumb items={[
                                { title: strings.tunes, path: "/Tunes" },
                                { title: props.tuneName }]} />

                            {seasons.map((season) => {
                                const seasonId = getTuneSeasonNumberFromId(season.id);
                                return <TuneSeasonsContents key={season.id} tuneId={props.tuneId} seasonId={seasonId} seasonName={season.name} />
                            })}
                        </div>
                        : null
            }
        </>
    );
}

export default TuneSeasonsMenu;
