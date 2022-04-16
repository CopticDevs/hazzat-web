import React from "react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import MainPaper, { Size } from "./MainPaper";

function Seasons() {
    const [dateSpecificSeasons, setDateSpecificSeasons] = useState<ISeasonInfo[]>([]);
    const [nonDateSpecificSeasons, setNonDateSpecificSeasons] = useState<ISeasonInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchHymns = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider();
        const seasons = await hymnsDataProvider.getSeasonList();
        const dsSeasons: ISeasonInfo[] = [];
        const ndsSeasons: ISeasonInfo[] = [];

        // Place seasons into buckets
        seasons.forEach((season) => {
            if (season.isDateSpecific) {
                dsSeasons.push(season);
            } else {
                ndsSeasons.push(season);
            }
        });

        setDateSpecificSeasons(dsSeasons.sort(HymnUtils.seasonInfoComparer));
        setNonDateSpecificSeasons(ndsSeasons.sort(HymnUtils.seasonInfoComparer));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        document.title = "Seasons - hazzat.com";
        fetchHymns();
    }, [fetchHymns]);

    return (
        <MainPaper size={Size.Wide}>
            <div>
                <div>Seasons</div>
                {
                    isLoading ? <div>Loading seasons...</div> :
                    dateSpecificSeasons && dateSpecificSeasons.length > 0 ?
                        dateSpecificSeasons.map((season) => {
                            return (
                                <div key={season.id}>
                                    <NavLink to={`${season.id}`}>{season.name}</NavLink>
                                </div>
                            )
                        })
                        :
                        <div>No seasons to display</div>
                }
                <div>Other Services</div>
                {
                    isLoading ? <div>Loading seasons...</div> :
                    nonDateSpecificSeasons && nonDateSpecificSeasons.length > 0 ?
                        nonDateSpecificSeasons.map((season) => {
                            return (
                                <div key={season.id}>
                                    <NavLink to={`${season.id}`} key={season.id}>{season.name}</NavLink>
                                </div>
                            )
                        }) :
                        <div>No seasons to display</div>
                }
            </div>
        </MainPaper>
    );
}

export default Seasons;
