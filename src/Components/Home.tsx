import { useContext, useEffect, useState } from "react";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { LanguageContext } from "../LanguageContext";
import { strings } from "../l8n";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { INavMenuItem } from "../Types/INavMenuItem";
import { formatDateRange, getCurrentSeasons, getUpcomingSeasons, SeasonWithDates } from "../Utils/SeasonDateUtils";
import "./Home.css";
import LoadingSpinner from "./LoadingSpinner";
import MainPaper from "./MainPaper";
import MyNavLink from "./MyNavLink";
import SidePaper from "./SidePaper";

interface IProps {
    navItems: INavMenuItem[];
}

function Home(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [currentSeasons, setCurrentSeasons] = useState<SeasonWithDates[]>([]);
    const [upcomingSeasons, setUpcomingSeasons] = useState<SeasonWithDates[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "hazzat.com";
        
        const loadSeasons = async () => {
            try {
                const dataProvider = new HymnsDataProvider(
                    languageProperties.localeName,
                    environmentProperties.baseUrl,
                    environmentProperties.cloudFrontUrl
                );
                
                const seasons = await dataProvider.getSeasonList();
                
                const current = getCurrentSeasons(seasons);
                const upcoming = getUpcomingSeasons(seasons, new Date(), 4);
                
                setCurrentSeasons(current);
                setUpcomingSeasons(upcoming);
            } catch (error) {
                console.error('Error loading seasons:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadSeasons();
    }, [languageProperties, environmentProperties]);

    return (
        <div className={languageProperties.isRtl ? "row dirRtl home-page" : "row home-page"}>
            <MainPaper>
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* Current Season(s) Section */}
                        <div className="current-seasons-section mb-4">
                            <h3 className="section-title">
                                {currentSeasons.length > 1 ? strings.currentSeasons : strings.currentSeason}
                            </h3>
                            {currentSeasons.map((season) => (
                                <MyNavLink key={season.id} to={`/Seasons/${season.id}`} className="season-link">
                                    <div className="season-card mb-3">
                                        <p className="navLink season-card-title">
                                            {season.displayName}
                                        </p>
                                        {season.dateStart && season.dateEnd && (
                                            <p className="season-card-date">
                                                {formatDateRange(season.dateStart, season.dateEnd, languageProperties.localeName)}
                                            </p>
                                        )}
                                        {season.verse && (
                                            <div 
                                                className="season-card-verse"
                                                dangerouslySetInnerHTML={{ __html: season.displayVerse }}
                                            />
                                        )}
                                    </div>
                                </MyNavLink>
                            ))}
                        </div>

                        {/* Upcoming Seasons Section */}
                        {upcomingSeasons.length > 0 && (
                            <div className="upcoming-seasons-section mb-4">
                                <h3 className="section-title">
                                    {strings.upcomingSeasons}
                                </h3>
                                {upcomingSeasons.map((season) => (
                                    <MyNavLink key={season.id} to={`/Seasons/${season.id}`} className="season-link">
                                        <div className="season-card mb-3">
                                            <p className="navLink season-card-title">
                                                {season.displayName}
                                            </p>
                                            {season.dateStart && season.dateEnd && (
                                                <p className="season-card-date">
                                                    {formatDateRange(season.dateStart, season.dateEnd, languageProperties.localeName)}
                                                </p>
                                            )}
                                            {season.verse && (
                                                <div 
                                                    className="season-card-verse"
                                                    dangerouslySetInnerHTML={{ __html: season.displayVerse }}
                                                />
                                            )}
                                        </div>
                                    </MyNavLink>
                                ))}
                            </div>
                        )}

                        {/* Other Services Section */}
                        <div className="other-links-section">
                            <h3 className="section-title">
                                <LocalizedMessage of="otherServices" />
                            </h3>
                            
                            {/* Other navigation items */}
                            {props.navItems.map((item) => {
                                if (item.disabled || item.id === "home" || item.id === "seasons") return null;
                                return (
                                    <p key={item.id}>
                                        <MyNavLink to={item.location} className="navLink">
                                            <LocalizedMessage of={item.id} />
                                        </MyNavLink>
                                    </p>
                                );
                            })}
                        </div>
                    </>
                )}
            </MainPaper>

            <SidePaper />
        </div>
    );
}

export default Home;
