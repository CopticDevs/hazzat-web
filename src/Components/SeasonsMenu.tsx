import { faCross } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
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
    const getLoadingSpinnerDiv = () => {
        return <div key="loading"><LoadingSpinner /></div>;
    };

    const loadingDiv = useMemo(() => getLoadingSpinnerDiv(), []);
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [dateSpecificSeasons, setDateSpecificSeasons] = useState<ISeasonInfo[]>([]);
    const [nonDateSpecificSeasons, setNonDateSpecificSeasons] = useState<ISeasonInfo[]>([]);
    const [dsSeasonNodes, setDsSeasonNodes] = useState<React.ReactNode[]>([loadingDiv]);
    const [ndsSeasonNodes, setNdsSeasonNodes] = useState<React.ReactNode[]>([loadingDiv]);
    const isMounted = useRef(true);

    const fetchSeasons = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl);
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
        }
    }, [languageProperties, environmentProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        document.title = strings.seasons + " - hazzat.com";
        fetchSeasons();

        return () => {
            isMounted.current = false;
        };
    }, [fetchSeasons]);

    useEffect(() => {
        const theNodes = dateSpecificSeasons.map((season) => {
            return (
                <div key={season.id} style={{ fontSize: "20px" }}>
                    <MyNavLink to={`${season.id}`}><FontAwesomeIcon icon={faCross} style={{paddingRight: "5px"} } /> {season.name}</MyNavLink>
                </div>
            )
        });

        if (theNodes.length === 0) {
            setDsSeasonNodes([loadingDiv]);
        } else {
            setDsSeasonNodes(theNodes);
        }
    }, [dateSpecificSeasons, loadingDiv]);

    useEffect(() => {
        const theNodes = nonDateSpecificSeasons.map((season) => {
            return (
                <div key={season.id} style={{ fontSize: "20px" }}>
                    <MyNavLink to={`${season.id}`}><FontAwesomeIcon icon={faCross} style={{ paddingRight: "5px" }} /> {season.name}</MyNavLink>
                </div>
            )
        });

        if (theNodes.length === 0) {
            setNdsSeasonNodes([loadingDiv]);
        } else {
            setNdsSeasonNodes(theNodes);
        }
    }, [nonDateSpecificSeasons, loadingDiv]);

    if (!isMounted.current) {
        return <LoadingSpinner />;
    }
    
    return (
        <div>
            <div className="pageTitle"><LocalizedMessage of="seasons" /></div>
            { dsSeasonNodes }
            <div className="otherServicesTitle"><LocalizedMessage of="otherServices" /></div>
            { ndsSeasonNodes }
        </div>
    );
}

export default SeasonsMenu;
