import React, { useEffect, useRef } from "react";
import { useContext, useState } from "react";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

function SeasonsMenu() {
    const { languageProperties } = useContext(LanguageContext);
    const [dateSpecificSeasons, setDateSpecificSeasons] = useState<ISeasonInfo[]>([]);
    const [nonDateSpecificSeasons, setNonDateSpecificSeasons] = useState<ISeasonInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchSeasons = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
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

        if (isMounted.current) {
            setDateSpecificSeasons(dsSeasons.sort(HymnUtils.seasonInfoComparer));
            setNonDateSpecificSeasons(ndsSeasons.sort(HymnUtils.seasonInfoComparer));
            setIsLoading(false);
        }
    }, [languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        document.title = strings.seasons + " - hazzat.com";
        fetchSeasons();

        return () => {
            isMounted.current = false;
        };
    }, [fetchSeasons]);
    
    return (
        <div>
            <div className="pageTitle"><LocalizedMessage of="seasons" /></div>
            {
                isLoading ? <LoadingSpinner /> :
                    dateSpecificSeasons && dateSpecificSeasons.length > 0 ?
                        dateSpecificSeasons.map((season) => {
                            return (
                                <div key={season.id}>
                                    <MyNavLink to={`${season.id}`}>{season.name}</MyNavLink>
                                </div>
                            )
                        })
                        :
                        <div><LocalizedMessage of="noSeasons" /></div>
            }
            <div className="otherServicesTitle"><LocalizedMessage of="otherServices" /></div>
            {
                isLoading ? <LoadingSpinner /> :
                    nonDateSpecificSeasons && nonDateSpecificSeasons.length > 0 ?
                        nonDateSpecificSeasons.map((season) => {
                            return (
                                <div key={season.id}>
                                    <MyNavLink to={`${season.id}`} key={season.id}>{season.name}</MyNavLink>
                                </div>
                            )
                        }) :
                        <div><LocalizedMessage of="noSeasons" /></div>
            }
        </div>
    );
}

export default SeasonsMenu;