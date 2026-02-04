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
        <div className={languageProperties.isRtl ? "row dirRtl" : "row"} style={languageProperties.isRtl ? { marginRight: "43px" } : {}}>
            <MainPaper>
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* Current Season(s) Section */}
                        <div className="current-seasons-section mb-4">
                            <h3 style={{ fontFamily: "Trajan Pro", marginBottom: "20px" }}>
                                {currentSeasons.length > 1 ? strings.currentSeasons : strings.currentSeason}
                            </h3>
                            {currentSeasons.map((season) => (
                                <MyNavLink key={season.id} to={`/Seasons/${season.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <div className="season-card mb-3" style={{ cursor: "pointer", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", transition: "background-color 0.2s" }}
                                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                        <p className="navLink" style={{ marginBottom: "5px", fontSize: "18px" }}>
                                            {season.displayName}
                                        </p>
                                        {season.dateStart && season.dateEnd && (
                                            <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                                                {formatDateRange(season.dateStart, season.dateEnd, languageProperties.localeName)}
                                            </p>
                                        )}
                                        {season.verse && (
                                            <div 
                                                style={{ fontSize: "14px", fontStyle: "italic", color: "#888" }}
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
                                <h3 style={{ fontFamily: "Trajan Pro", marginBottom: "20px" }}>
                                    {strings.upcomingSeasons}
                                </h3>
                                {upcomingSeasons.map((season) => (
                                    <MyNavLink key={season.id} to={`/Seasons/${season.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                        <div className="season-card mb-3" style={{ cursor: "pointer", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", transition: "background-color 0.2s" }}
                                             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                            <p className="navLink" style={{ marginBottom: "5px", fontSize: "18px" }}>
                                                {season.displayName}
                                            </p>
                                            {season.dateStart && season.dateEnd && (
                                                <p style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
                                                    {formatDateRange(season.dateStart, season.dateEnd, languageProperties.localeName)}
                                                </p>
                                            )}
                                            {season.verse && (
                                                <div 
                                                    style={{ fontSize: "14px", fontStyle: "italic", color: "#888" }}
                                                    dangerouslySetInnerHTML={{ __html: season.displayVerse }}
                                                />
                                            )}
                                        </div>
                                    </MyNavLink>
                                ))}
                            </div>
                        )}

                        {/* Other Services Section */}
                        <div className="other-links-section" style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #ddd" }}>
                            <h3 style={{ fontFamily: "Trajan Pro", marginBottom: "20px" }}>
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
