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
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        const seasons = await hymnsDataProvider.getSeasonList();
        
        // Separate Annual season
        const annual = seasons.find(s => s.name.toLowerCase().includes('annual'));
        const nonAnnualSeasons = seasons.filter(s => !s.name.toLowerCase().includes('annual'));
        
        // Separate date-specific and non-date-specific seasons
        const dateSpecific = nonAnnualSeasons.filter(s => s.isDateSpecific);
        const nonDateSpecific = nonAnnualSeasons.filter(s => !s.isDateSpecific);
        
        // Sort date-specific seasons by date (January to December order)
        const currentYear = new Date().getFullYear();
        const sortedDateSpecific = dateSpecific.sort((a, b) => {
            const aRange = a.dateRanges?.find(r => r.year === currentYear);
            const bRange = b.dateRanges?.find(r => r.year === currentYear);
            
            if (!aRange && !bRange) return a.order - b.order;
            if (!aRange) return 1;
            if (!bRange) return -1;
            
            return aRange.dateStart.localeCompare(bRange.dateStart);
        });
        
        // Combine: Annual first, then date-specific, then non-date-specific
        const dsSeasons: ISeasonInfo[] = annual ? [annual, ...sortedDateSpecific] : sortedDateSpecific;
        const ndsSeasons: ISeasonInfo[] = nonDateSpecific.sort((a, b) => a.order - b.order);

        if (isMounted.current) {
            setDateSpecificSeasons(dsSeasons);
            setNonDateSpecificSeasons(ndsSeasons);
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
                    <MyNavLink to={`${season.id}`}><FontAwesomeIcon icon={faCross} style={{paddingRight: "5px"} } /> {season.displayName}</MyNavLink>
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
                    <MyNavLink to={`${season.id}`}><FontAwesomeIcon icon={faCross} style={{ paddingRight: "5px" }} /> {season.displayName}</MyNavLink>
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
