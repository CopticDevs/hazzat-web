import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnReference, IHymnSearchResult, ISearchResult } from "../Providers/HymnsDataProvider/Models/ISearchResult";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { getHymnDisplayName } from "../Utils/DisplayNameUtils";
import LoadingSpinner from "./LoadingSpinner";
import MainPaper, { Size } from "./MainPaper";

interface GlobalSearchProps {
    dataProvider: IHymnsDataProvider;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ dataProvider }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();
    const { languageProperties } = useContext(LanguageContext);

    // Debounced search (300ms)
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const searchResults: ISearchResult[] = [];
                const currentLanguage = languageProperties.localeName;
                
                // Search seasons by name only (both English and Arabic)
                const seasons = await dataProvider.getSeasonList();
                const seasonResults = seasons.filter(s => {
                    // Search both English and Arabic names
                    const matchesEnglish = s.name.toLowerCase().includes(query.toLowerCase());
                    const matchesArabic = s.nameAr?.toLowerCase().includes(query.toLowerCase());
                    return matchesEnglish || matchesArabic;
                });
                
                seasonResults.forEach(season => {
                    searchResults.push({
                        type: 'season',
                        season: season
                    });
                });
                
                // Search hymns using reference index (both English and Arabic)
                const refIndex = await dataProvider.getReferenceIndex();
                
                const hymnIds = Object.keys(refIndex).filter(hymnId => {
                    const hymnRef = refIndex[hymnId];
                    
                    // Search in English name, Arabic name, or hymn ID
                    const matchesEnglish = hymnRef.name.toLowerCase().includes(query.toLowerCase());
                    const matchesArabic = hymnRef.nameAr?.toLowerCase().includes(query.toLowerCase());
                    const matchesId = hymnId.toLowerCase().includes(query.toLowerCase());
                    
                    return matchesEnglish || matchesArabic || matchesId;
                });
                
                // Build hymn search results with service references
                for (const hymnId of hymnIds) {
                    const hymnRef = refIndex[hymnId];
                    const references: IHymnReference[] = [];
                    const servicePaths = hymnRef.services;
                    
                    for (const path of servicePaths) {
                        const [seasonId, serviceId] = path.split('/');
                        
                        // Get season name
                        const season = seasons.find(s => s.id === seasonId);
                        if (!season) continue;
                        
                        // Get service to find service name
                        const service = await dataProvider.getService(seasonId, serviceId);
                        if (!service) continue;
                        
                        references.push({
                            seasonId: seasonId,
                            seasonName: season.displayName,
                            serviceId: serviceId,
                            serviceName: service.displayName
                        });
                    }
                    
                    if (references.length > 0) {
                        // Use appropriate language name, fallback to English if Arabic not available
                        const displayName = getHymnDisplayName(hymnRef, currentLanguage);
                        
                        searchResults.push({
                            type: 'hymn',
                            hymn: {
                                id: hymnId,
                                name: displayName,
                                references: references
                            }
                        });
                    }
                }
                
                setResults(searchResults);
                setHasSearched(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
                setHasSearched(true);
            } finally {
                setIsLoading(false);
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [query, dataProvider, languageProperties.localeName]);

    const handleSeasonClick = (season: ISeasonInfo) => {
        navigate(`/Seasons/${season.id}`);
    };

    const handleHymnClick = (hymn: IHymnSearchResult, reference: IHymnReference) => {
        // Navigate to service and highlight hymn
        navigate(`/Seasons/${reference.seasonId}/services/${reference.serviceId}/hymns/${hymn.id}`);
    };

    return (
        <MainPaper size={Size.Wide}>
            <div className="global-search">
                <h2><LocalizedMessage of="search" /></h2>
                
                <div className="search-input-container mb-4">
                    <div className="input-group">
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input 
                            type="search"
                            className="form-control"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={languageProperties.localeName === 'ar' ? 'ابحث عن المواسم والألحان...' : 'Search seasons and hymns...'}
                            autoFocus
                        />
                    </div>
                </div>

                {isLoading && (
                    <div className="text-center my-4">
                        <LoadingSpinner />
                    </div>
                )}

                {!isLoading && hasSearched && results.length === 0 && (
                    <div className="alert alert-info">
                        <LocalizedMessage of="noSearchResults" />
                    </div>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="search-results">
                        {/* Season Results */}
                        {results.filter(r => r.type === 'season').length > 0 && (
                            <div className="season-results mb-4">
                                <h4><LocalizedMessage of="seasons" /></h4>
                                <div className="list-group">
                                    {results.filter(r => r.type === 'season').map(result => (
                                        <button
                                            key={result.season!.id}
                                            className="list-group-item list-group-item-action"
                                            onClick={() => handleSeasonClick(result.season!)}
                                        >
                                            <h5 className="mb-1">{result.season!.displayName}</h5>
                                            {result.season!.verse && (
                                                <p className="mb-0 text-muted">{result.season!.displayVerse}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hymn Results */}
                        {results.filter(r => r.type === 'hymn').length > 0 && (
                            <div className="hymn-results">
                                <h4><LocalizedMessage of="hymns" /></h4>
                                <div className="list-group">
                                    {results.filter(r => r.type === 'hymn').map(result => (
                                        <div key={result.hymn!.id} className="list-group-item">
                                            <h5 className="mb-2">{result.hymn!.name}</h5>
                                            <div className="hymn-references">
                                                <small className="text-muted">
                                                    <LocalizedMessage of="foundIn" />:
                                                </small>
                                                <ul className="list-unstyled ms-3 mt-1">
                                                    {result.hymn!.references.map((ref, idx) => (
                                                        <li key={idx}>
                                                            <button
                                                                className="btn btn-link btn-sm p-0"
                                                                onClick={() => handleHymnClick(result.hymn!, ref)}
                                                            >
                                                                {ref.seasonName} → {ref.serviceName}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainPaper>
    );
};

export default GlobalSearch;
