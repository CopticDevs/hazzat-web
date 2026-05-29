import React, { useContext, useEffect, useRef, useState } from "react";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import "./BookletsMenu.css";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

function BookletsMenu() {
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [seasonList, setSeasonList] = useState<ISeasonInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchSeasons = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        const seasons = await hymnsDataProvider.getSeasonList();

        if (isMounted.current) {
            setSeasonList([...seasons].sort((a, b) => a.order - b.order));
            setIsLoading(false);
        }
    }, [languageProperties, environmentProperties]);

    useEffect(() => {
        isMounted.current = true;
        document.title = strings.booklets + " - hazzat.com";
        fetchSeasons();

        return () => {
            isMounted.current = false;
        };
    }, [fetchSeasons]);

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner />;
        }

        if (seasonList.length === 0) {
            return <div><LocalizedMessage of="noBooklets" /></div>;
        }

        return (
            <div className="container bookletMenuContainer">
                <div className="row">
                    {seasonList.map(season => (
                        <div key={season.id} className="col-sm-6 col-lg-4 bookletDiv">
                            <MyNavLink to={`${season.id}`} className="bookletSeasonCard">
                                <span className="bookletSeasonName">{season.displayName}</span>
                            </MyNavLink>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="pageTitle"><LocalizedMessage of="booklets" /></div>
            {renderContent()}
        </div>
    );
}

export default BookletsMenu;
