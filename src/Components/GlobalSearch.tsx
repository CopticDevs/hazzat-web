import { strings } from "../l8n";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ISearchResult } from "../Providers/HymnsDataProvider/Models/ISearchResult";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { searchContent } from "../Providers/HymnsDataProvider/Search";
import ContentLoadError from "./ContentLoadError";
import SearchHighlight from "./SearchHighlight";
import "./GlobalSearch.css";
import { normalizeSearch } from "../Providers/HymnsDataProvider/SearchMatching";
import MainPaper, { Size } from "./MainPaper";
import MyNavLink from "./MyNavLink";

interface GlobalSearchProps {
    dataProvider: IHymnsDataProvider;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ dataProvider }) => {
    const [page, setPage] = useState(1);
    const pageSummary = useRef<HTMLParagraphElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ISearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [wordsLoading, setWordsLoading] = useState(false);
    const [wordsFailed, setWordsFailed] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    const [includeText, setIncludeText] = useState(false);
    const navigate = useNavigate();
    const { languageProperties } = useContext(LanguageContext);
    useEffect(() => { document.title = `${strings.search} - hazzat.com`; }, [languageProperties.localeName]);

    useEffect(() => {
        let active = true;
        setFailed(false);
        setWordsFailed(false);
        setWordsLoading(false);
        setResults([]);
        setPage(1);
        setHasSearched(false);
        if (normalizeSearch(query).length < 2) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const timer = setTimeout(async () => {
            let titlesReady = false;
            try {
                const found = await searchContent(dataProvider, query, languageProperties.localeName, includeText, titles => {
                    titlesReady = true;
                    if (active) {
                        setResults(titles);
                        setHasSearched(true);
                        setIsLoading(false);
                        setWordsLoading(true);
                    }
                });
                if (active) { setResults(found); setHasSearched(true); }
            } catch {
                if (active) { if (titlesReady) setWordsFailed(true); else setFailed(true); }
            } finally {
                if (active) { setIsLoading(false); setWordsLoading(false); }
            }
        }, 300);
        return () => { active = false; clearTimeout(timer); };
    }, [query, dataProvider, languageProperties.localeName, retry, includeText]);

    const handleSeasonClick = (season: ISeasonInfo) => {
        navigate(`/Seasons/${season.id}`);
    };

    const pageCount = Math.max(1, Math.ceil(results.length / 10));
    const currentPage = Math.min(page, pageCount);
    const visibleResults = results.slice((currentPage - 1) * 10, currentPage * 10);
    const arabic = languageProperties.localeName === 'ar';
    const changePage = (next: number) => {
        setPage(Math.max(1, Math.min(next, pageCount)));
        pageSummary.current?.focus();
        pageSummary.current?.scrollIntoView?.({ block: 'nearest' });
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
                            aria-describedby="search-help"
                            maxLength={200}
                            className="form-control"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={languageProperties.localeName === 'ar' ? 'ابحث عن المواسم والألحان...' : 'Search seasons and hymns...'}
                            autoFocus
                        />
                    </div>
                    <p id="search-help" className="text-muted mt-2 mb-2">
                        {languageProperties.localeName === 'ar' ? 'ابحث بالعنوان أو بتهجئة تقريبية. للبحث بكلمات تتذكرها، فعّل البحث في نصوص الألحان.'
                            : 'Search by title or approximate spelling. To find words you remember, include hymn text.'}
                    </p>
                    {dataProvider.getSearchTextIndex && <div className="form-check">
                        <input id="search-hymn-text" type="checkbox" className="form-check-input" checked={includeText}
                            onChange={event => setIncludeText(event.target.checked)} />
                        <label htmlFor="search-hymn-text" className="form-check-label">
                            {languageProperties.localeName === 'ar' ? 'البحث في نصوص الألحان (قد يستغرق التحميل الأول وقتًا أطول)' : 'Search hymn words (first search may take longer)'}
                        </label>
                    </div>}
                </div>

                <div role="status" aria-live="polite" aria-atomic="true" className={wordsLoading || isLoading ? 'alert alert-info search-loading' : 'visually-hidden'}>
                    {(wordsLoading || isLoading) && <span className="search-spinner" aria-hidden="true" />}
                    <span>{wordsLoading ? (languageProperties.localeName === 'ar' ? `عدد نتائج العناوين: ${results.length}. جارٍ البحث في كلمات الألحان…`
                        : `${results.length} title ${results.length === 1 ? 'match' : 'matches'}. Still searching hymn words…`)
                        : isLoading ? (languageProperties.localeName === 'ar' ? 'جارٍ البحث' : 'Searching')
                        : hasSearched && !failed && !wordsFailed ? (languageProperties.localeName === 'ar' ? `عدد النتائج: ${results.length}` : `${results.length} ${results.length === 1 ? 'result' : 'results'}`) : ''}</span>
                </div>

                {failed && <ContentLoadError retry={() => setRetry(value => value + 1)} />}
                {wordsFailed && <div role="alert" className="alert alert-warning">
                    <p>{languageProperties.localeName === 'ar' ? 'تعذر إكمال البحث في كلمات الألحان. نتائج العناوين فقط متاحة الآن.'
                        : 'Hymn-word search could not be completed. Only title matches are available.'}</p>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setRetry(value => value + 1)}>
                        {languageProperties.localeName === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                </div>}

                {!isLoading && !wordsLoading && !failed && !wordsFailed && hasSearched && results.length === 0 && (
                    <div className="alert alert-info">
                        <LocalizedMessage of="noSearchResults" />
                    </div>
                )}

                {!isLoading && results.length > 0 && (
                    <div className="search-results">
                        <p className="search-page-summary" ref={pageSummary} tabIndex={-1} aria-live="polite" aria-atomic="true">
                            {arabic ? `عرض ${(currentPage - 1) * 10 + 1}–${Math.min(currentPage * 10, results.length)} من ${results.length} نتيجة`
                                : `Showing ${(currentPage - 1) * 10 + 1}–${Math.min(currentPage * 10, results.length)} of ${results.length} results`}
                        </p>
                        {pageCount > 1 && <nav className="search-pagination" aria-label={arabic ? 'صفحات نتائج البحث' : 'Search result pages'}>
                            <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>{arabic ? 'السابق' : 'Previous'}</button>
                            <span>{arabic ? `الصفحة ${currentPage} من ${pageCount}` : `Page ${currentPage} of ${pageCount}`}</span>
                            <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>{arabic ? 'التالي' : 'Next'}</button>
                        </nav>}
                        {/* Season Results */}
                        {visibleResults.filter(r => r.type === 'season').length > 0 && (
                            <div className="season-results mb-4">
                                <h4><LocalizedMessage of="seasons" /></h4>
                                <div className="list-group">
                                    {visibleResults.filter(r => r.type === 'season').map(result => (
                                        <button
                                            key={result.season!.id}
                                            className="list-group-item list-group-item-action"
                                            onClick={() => handleSeasonClick(result.season!)}
                                        >
                                            <h5 className="mb-1"><SearchHighlight text={result.season!.displayName} query={query} /></h5>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hymn Results */}
                        {visibleResults.filter(r => r.type === 'hymn').length > 0 && (
                            <div className="hymn-results">
                                <h4><LocalizedMessage of="hymns" /></h4>
                                <div className="list-group">
                                    {visibleResults.filter(r => r.type === 'hymn').map(result => (
                                        <div key={result.hymn!.id} className="list-group-item">
                                            <h5 className="mb-2"><SearchHighlight text={result.hymn!.name} query={query} /></h5>
                                            {result.hymn!.snippet && <p dir="auto" className="mb-2"><SearchHighlight text={result.hymn!.snippet} query={query} /></p>}
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
                                                                <SearchHighlight text={`${ref.seasonName} → ${ref.serviceName}${ref.hymnName ? ` → ${ref.hymnName}` : ""}`} query={query} />
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
