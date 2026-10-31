import { strings } from "../l8n";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISearchResult } from "../Providers/HymnsDataProvider/Models/ISearchResult";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { searchContent } from "../Providers/HymnsDataProvider/Search";
import ContentLoadError from "./ContentLoadError";
import LoadingSpinner from "./LoadingSpinner";
import MainPaper, { Size } from "./MainPaper";
import MyNavLink from "./MyNavLink";

interface GlobalSearchProps {
    dataProvider: IHymnsDataProvider;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ dataProvider }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    const navigate = useNavigate();
    const { languageProperties } = useContext(LanguageContext);
    useEffect(() => { document.title = `${strings.search} - hazzat.com`; }, [languageProperties.localeName]);

    useEffect(() => {
        let active = true;
        setFailed(false);
        setResults([]);
        setHasSearched(false);
        if (query.trim().length < 2) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const found = await searchContent(dataProvider, query, languageProperties.localeName);
                if (active) { setResults(found); setHasSearched(true); }
            } catch {
                if (active) setFailed(true);
            } finally {
                if (active) setIsLoading(false);
            }
        }, 300);
        return () => { active = false; clearTimeout(timer); };
    }, [query, dataProvider, languageProperties.localeName, retry]);

    const handleSeasonClick = (season: ISeasonInfo) => {
        navigate(`/Seasons/${season.id}`);
    };

    return (
        <MainPaper size={Size.Wide}>
            <div className="global-search">
                <h1 className="pageTitle"><LocalizedMessage of="search" /></h1>
                
                <div className="search-input-container mb-4">
                    <div className="input-group">
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input 
                            type="search"
                            aria-label={strings.search}
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

                {failed && <ContentLoadError retry={() => setRetry(value => value + 1)} />}

                {!isLoading && !failed && hasSearched && results.length === 0 && (
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
                                                            <MyNavLink
                                                                to={`/Seasons/${ref.seasonId}/services/${ref.serviceId}/hymns/${result.hymn!.id}`}
                                                            >
                                                                {ref.seasonName} → {ref.serviceName}{ref.hymnName ? ` → ${ref.hymnName}` : ""}
                                                            </MyNavLink>
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
