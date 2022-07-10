import React, { useEffect } from "react";
import { useContext, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { stringFormat } from "../stringFormat";
import MainPaper, { Size } from "./MainPaper";
import "./SeasonDetails.css";


function SeasonDetails() {
    let { seasonId } = useParams();
    const { languageProperties } = useContext(LanguageContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchSeason = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const seasonIdParam: string = seasonId || "";
        const seasonResponse = await hymnsDataProvider.getSeason(seasonIdParam);
        setSeasonInfo(seasonResponse);
        setIsLoading(false);
    }, [seasonId, languageProperties]);

    useEffect(() => {
        fetchSeason();
    }, [fetchSeason]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${seasonInfo?.name} - hazzat.com`;
    }, [isLoading, seasonInfo]);

    return (
        <MainPaper size={Size.Wide}>
            {
                isLoading ? <div><LocalizedMessage of="loading" /></div> :
                    !!seasonInfo ?
                        <div>
                            <div className="pageTitle">{stringFormat(strings.seasonTitle, seasonInfo.name)}</div>
                            <div className="seasonVerse" dangerouslySetInnerHTML={{ __html: seasonInfo.verse }} />
                            <div className="breadcrumbDiv"><NavLink to="/Seasons" className="breadcrumbLink"><LocalizedMessage of="seasons" /></NavLink> &gt; {seasonInfo.name}</div>
                        </div>
                        : null
            }
        </MainPaper>
    );
}

export default SeasonDetails;
