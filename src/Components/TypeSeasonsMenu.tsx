import React, { useContext, useEffect, useRef, useState } from "react";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { getTypeSeasonNumberFromId } from "../Utils/ParserUtils";
import BreadCrumb from "./BreadCrumb";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import TypeSeasonsContents from "./TypeSeasonContents";

interface IProps {
    typeName: string;
    typeId: string;
}
function TypeSeasonsMenu(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [seasons, setSeasons] = useState<ISeasonInfo[]>([]);
    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl);
        const seasonsResponse = await hymnsDataProvider.getTypeSeasonList(props.typeId);

        if (isMounted.current) {
            setSeasons(seasonsResponse.sort(HymnUtils.seasonInfoComparer));
        }
    }, [languageProperties, environmentProperties, props.typeId, isMounted]);

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
                                { title: strings.types, path: "/Types" },
                                { title: props.typeName }]} />

                            {seasons.map((season) => {
                                const seasonId = getTypeSeasonNumberFromId(season.id);
                                return <TypeSeasonsContents key={season.id} typeId={props.typeId} seasonId={seasonId} seasonName={season.name} />
                            })}
                        </div>
                        : null
            }
        </>
    );
}

export default TypeSeasonsMenu;
