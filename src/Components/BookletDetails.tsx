import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    BookletFormatKind,
    BookletGroupingKind,
    BookletLayoutKind,
    bookletFormatKinds,
    generateSeasonBookletPdf,
    getBookletFileName,
    getBookletSections,
    hasBookletFormat,
    hasBookletVariationContent
} from "../Booklets/BookletPdfGenerator";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { IHymnContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./BookletDetails.css";
import BreadCrumb from "./BreadCrumb";
import InvalidAddressMessage from "./InvalidAddressMessage";
import LoadingSpinner from "./LoadingSpinner";
import ContentLoadError from "./ContentLoadError";

type BookletVariation = IVariationInfo<IHymnContent> & { formatId: string };

function BookletDetails() {
    const { bookletId } = useParams();
    const seasonIdParam = bookletId || "";
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [services, setServices] = useState<IServiceInfo[]>([]);
    const [selection, setSelection] = useState<BookletSelectionState>(createEmptySelection());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeDownload, setActiveDownload] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [formats, setFormats] = useState<BookletFormatKind[]>(["text", "regular"]);
    const [grouping, setGrouping] = useState<BookletGroupingKind>("hymn");
    const [layout, setLayout] = useState<BookletLayoutKind>("display");
    const [allowMissing, setAllowMissing] = useState(false);
    const [preview, setPreview] = useState<{ url: string; name: string }>();

    const isMounted = useRef(true);
    const requestId = useRef(0);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        setAllowMissing(false);
        setPreview(undefined);
    }, [selection, formats, grouping, layout]);

    useEffect(() => () => {
        if (preview) URL.revokeObjectURL(preview.url);
    }, [preview]);

    const fetchFromBackend = React.useCallback(async () => {
        const request = ++requestId.current;
        const current = () => isMounted.current && request === requestId.current;
        setIsLoading(true);
        setLoadFailed(false);
        setActiveDownload(undefined);
        setPreview(undefined);
        try {
            const provider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
            const seasonResponse = await provider.getSeason(seasonIdParam);
            const serviceResponse = seasonResponse ? await provider.getServiceList(seasonIdParam) : [];
            if (current()) {
                const sorted = [...serviceResponse].sort((a, b) => a.order - b.order);
                setSeasonInfo(seasonResponse);
                setServices(sorted);
                setSelection(createDefaultSelection(sorted));
                const available = bookletFormatKinds.filter(kind => hasBookletFormat(sorted, kind));
                const preferred = available.filter(kind => kind === "text" || kind === "regular");
                setFormats(preferred.length ? preferred : available.slice(0, 1));
                setErrorMessage(undefined);
            }
        } catch {
            if (current()) setLoadFailed(true);
        } finally {
            if (current()) setIsLoading(false);
        }
    }, [seasonIdParam, languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    const pageTitle = seasonInfo ? `${seasonInfo.displayName} ${strings.booklet}` : strings.booklets;

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${pageTitle} - hazzat.com`;
    }, [isLoading, pageTitle]);

    const reviewBooklet = async () => {
        if (!seasonInfo || loadFailed) {
            return;
        }

        const downloadKey = "combined";
        const request = requestId.current;
        const selected = getSelectedBookletServices(services, selection, formats);
        const selectedKinds = bookletFormatKinds.filter(kind => getBookletSections(selected, [kind]).length > 0);
        if (!selectedKinds.length || (getMissingBookletFormats(services, selection, formats).length > 0 && !allowMissing)) return;
        setActiveDownload(downloadKey);
        setErrorMessage(undefined);

        try {
            const pdfBytes = await generateSeasonBookletPdf({
                season: seasonInfo,
                services: selected,
                formatKinds: selectedKinds,
                groupingKind: grouping,
                layoutKind: layout
            });
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const objectUrl = URL.createObjectURL(blob);
            if (isMounted.current && request === requestId.current) {
                setPreview({ url: objectUrl, name: getBookletFileName(seasonInfo, selectedKinds, layout) });
            } else URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error("Failed to generate booklet PDF", error);
            if (isMounted.current && request === requestId.current) {
                setErrorMessage(strings.bookletDownloadError);
            }
        } finally {
            if (isMounted.current && request === requestId.current) {
                setActiveDownload(undefined);
            }
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (loadFailed) return <ContentLoadError retry={fetchFromBackend} />;

    if (!seasonInfo) {
        return <InvalidAddressMessage />;
    }

    const selectedServices = getSelectedBookletServices(services, selection, formats);
    const sections = getBookletSections(selectedServices, bookletFormatKinds, grouping);
    const missing = getMissingBookletFormats(services, selection, formats);
    const busy = !!activeDownload;
    const availableFormats = bookletFormatKinds.filter(kind => hasBookletFormat(services, kind));
    const presets: { kinds: BookletFormatKind[]; label: string }[] = [
        { kinds: ["text"], label: strings.bookletTextOnly },
        { kinds: ["regular"], label: strings.hazzatFormatName },
        { kinds: ["vertical"], label: strings.verticalHazzatFormatName },
        { kinds: ["musical"], label: strings.musicalNotesLinkSuffix },
        { kinds: ["text", "regular"], label: strings.bookletTextHazzat },
        { kinds: ["text", "vertical"], label: strings.bookletTextVerticalHazzat },
        { kinds: availableFormats, label: strings.bookletAllFormats }
    ];
    const applyFormats = (next: BookletFormatKind[]) => {
        setFormats(next);
        setSelection(current => ({ ...current, formats: {} }));
    };

    return (
        <div>
            <h1 className="pageTitle">{pageTitle}</h1>

            <BreadCrumb items={[
                { title: strings.booklets, path: "/Booklets" },
                { title: seasonInfo.displayName }]} />

            <div className="bookletDetailsIntro">
                {seasonInfo.displayVerse && (
                    <div className="bookletSeasonVerse" dangerouslySetInnerHTML={{ __html: seasonInfo.displayVerse }} />
                )}
            </div>

            {errorMessage && <div role="alert" className="alert alert-danger">{errorMessage}</div>}

            <div className="container bookletBuilder">
                <h2>{strings.buildBooklet}</h2>
                <p>{strings.buildBookletDescription}</p>
                <fieldset disabled={busy}>
                <legend>{strings.bookletChooseFormats}</legend>
                <div className="bookletPresetRow">
                    {presets.filter(preset => preset.kinds.length > 0 && preset.kinds.every(kind => availableFormats.includes(kind))).map(preset => (
                        <button key={preset.label} type="button" className="bookletChoice" aria-pressed={preset.kinds.join() === formats.join()}
                            onClick={() => applyFormats(preset.kinds)}>
                            {preset.label}
                        </button>
                    ))}
                </div>
                <div className="bookletFormatChoices">
                    {availableFormats.map(kind => <label key={kind}>
                        <input type="checkbox" checked={formats.includes(kind)} onChange={event =>
                            applyFormats(bookletFormatKinds.filter(k => k === kind ? event.target.checked : formats.includes(k)))} />
                        {getFormatName(kind)}
                    </label>)}
                </div>
                <p className="bookletHint">{strings.bookletFormatsHint}</p>
                <BookletContentSelector
                    services={services}
                    selection={selection}
                    onSelectionChange={setSelection}
                    formats={formats}
                    availableFormats={availableFormats}
                />
                <h3>{strings.bookletArrange}</h3>
                <div className="bookletLayoutChoices">
                    <label>{strings.bookletGroupContent}
                        <select value={grouping} onChange={event => setGrouping(event.target.value as BookletGroupingKind)}>
                            <option value="hymn">{strings.bookletByHymn}</option>
                            <option value="format">{strings.bookletByFormat}</option>
                        </select>
                    </label>
                    <label>{strings.bookletPdfLayout}
                        <select value={layout} onChange={event => setLayout(event.target.value as BookletLayoutKind)}>
                            <option value="display">{strings.bookletDeviceLayout}</option>
                            <option value="print">{strings.bookletPrintLayout}</option>
                        </select>
                    </label>
                </div>
                {missing.length > 0 && <div className="bookletMissing" role="status">
                    <strong>{strings.bookletMissingFormats}</strong>
                    <ul>{missing.map(item => <li key={item.key}>{item.label}</li>)}</ul>
                    <label><input type="checkbox" checked={allowMissing} onChange={event => setAllowMissing(event.target.checked)} /> {strings.bookletSkipMissing}</label>
                </div>}
                <section className="bookletReview" aria-labelledby="bookletReviewTitle">
                    <h3 id="bookletReviewTitle">{strings.bookletAtGlance}</h3>
                    <p aria-live="polite">{selectedServices.reduce((sum, service) => sum + (service.hymns?.length || 0), 0)} {strings.bookletHymnsSelected} · {strings.bookletOnePdf}</p>
                    <details><summary>{strings.bookletContentOrder}</summary>
                        <ol>{sections.map((section, i) => <li key={i}>{section.service.displayName || section.service.name} / {section.hymn.displayName || section.hymn.name} · {getFormatName(section.formatKind)}</li>)}</ol>
                    </details>
                    {!sections.length && <p role="status">{strings.bookletNoSelectedContent}</p>}
                    <button type="button" className="bookletPrimaryAction" disabled={!sections.length || (missing.length > 0 && !allowMissing)} onClick={reviewBooklet}>
                        {busy ? strings.generatingBooklet : strings.bookletReviewPdf}
                    </button>
                </section>
                </fieldset>
                {preview && <section className="bookletPdfPreview" aria-labelledby="bookletPreviewTitle">
                    <h3 id="bookletPreviewTitle">{strings.bookletPdfPreview}</h3>
                    <div className="bookletPresetRow">
                        <a className="bookletPrimaryAction" href={preview.url} download={preview.name}>{strings.bookletDownloadPdf}</a>
                        <a href={preview.url} target="_blank" rel="noopener noreferrer">{strings.bookletOpenPdf}</a>
                    </div>
                    <object data={preview.url} type="application/pdf" aria-label={strings.bookletPdfPreview}>
                        <p>{strings.bookletPreviewFallback}</p>
                    </object>
                </section>}
            </div>
        </div>
    );
}

export interface BookletSelectionState {
    services: Record<string, boolean>;
    hymns: Record<string, boolean>;
    variations: Record<string, boolean>;
    formats?: Record<string, BookletFormatKind[]>;
}

interface BookletContentSelectorProps {
    services: IServiceInfo[];
    selection: BookletSelectionState;
    onSelectionChange: React.Dispatch<React.SetStateAction<BookletSelectionState>>;
    formats: BookletFormatKind[];
    availableFormats: BookletFormatKind[];
}

function BookletContentSelector(props: BookletContentSelectorProps) {
    const resetSelection = () => props.onSelectionChange(createDefaultSelection(props.services));

    return (
        <div className="bookletSelectionPanel">
            <div className="bookletSelectionHeader">
                <div className="bookletSelectionTitle">{strings.bookletContentSelection}</div>
                <button type="button" className="bookletSelectionReset" onClick={resetSelection}>
                    {strings.resetBookletSelection}
                </button>
            </div>

            <div className="bookletServiceSelection">
                {props.services.map(service => (
                    <details key={service.id} className="bookletServiceSelector">
                        <summary>
                            <label onClick={event => event.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={isServiceSelected(props.selection, service)}
                                    onChange={event => toggleServiceSelection(props.onSelectionChange, service, event.target.checked)}
                                />
                                {service.displayName || service.name}
                            </label>
                        </summary>

                        {[...(service.hymns || [])].sort((a, b) => a.order - b.order).map(hymn => {
                            const selectableVariations = getSelectableVariations(hymn).filter(variation =>
                                (hymn.formats?.find(format => format.id === variation.formatId)?.variations?.length || 0) > 1);

                            return (
                                <div key={hymnKey(service, hymn)} className="bookletHymnSelector">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={isHymnSelected(props.selection, service, hymn)}
                                            onChange={event => toggleHymnSelection(props.onSelectionChange, service, hymn, event.target.checked)}
                                        />
                                        {hymn.displayName || hymn.name}
                                    </label>

                                    <div className="bookletFormatChoices">
                                        {props.availableFormats.map(kind => <label key={kind}>
                                            <input type="checkbox" checked={(props.selection.formats?.[hymnKey(service, hymn)] ?? props.formats).includes(kind)}
                                                onChange={event => {
                                                    const checked = event.target.checked;
                                                    props.onSelectionChange(current => {
                                                        const currentFormats = current.formats?.[hymnKey(service, hymn)] ?? props.formats;
                                                        return { ...current, formats: { ...current.formats, [hymnKey(service, hymn)]: bookletFormatKinds.filter(k => k === kind ? checked : currentFormats.includes(k)) } };
                                                    });
                                                }} />{getFormatName(kind)}
                                        </label>)}
                                    </div>

                                    {selectableVariations.length > 0 && (
                                        <div className="bookletVariationSelectorGroup">
                                            {selectableVariations.filter(variation => (props.selection.formats?.[hymnKey(service, hymn)] ?? props.formats).includes(formatKindFromId(variation.formatId))).map(variation => (
                                                <label key={variationKey(service, hymn, variation)} className="bookletVariationSelector">
                                                    <input
                                                        type="checkbox"
                                                        checked={isVariationSelected(props.selection, service, hymn, variation)}
                                                        onChange={event => toggleVariationSelection(props.onSelectionChange, service, hymn, variation, event.target.checked)}
                                                    />
                                                    {getVariationDisplayName(variation)} <small>({getFormatName(formatKindFromId(variation.formatId))})</small>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </details>
                ))}
            </div>
        </div>
    );
}

function createEmptySelection(): BookletSelectionState {
    return {
        services: {},
        hymns: {},
        variations: {}
    };
}

function createDefaultSelection(services: IServiceInfo[]): BookletSelectionState {
    const selection = createEmptySelection();
    services.forEach(service => {
        selection.services[service.id] = true;
        (service.hymns || []).forEach(hymn => {
            selection.hymns[hymnKey(service, hymn)] = true;
            getSelectableVariations(hymn).forEach(variation => {
                selection.variations[variationKey(service, hymn, variation)] = true;
            });
        });
    });
    return selection;
}

function toggleServiceSelection(
    setSelection: React.Dispatch<React.SetStateAction<BookletSelectionState>>,
    service: IServiceInfo,
    checked: boolean
) {
    setSelection(selection => {
        const next = cloneSelection(selection);
        next.services[service.id] = checked;
        (service.hymns || []).forEach(hymn => {
            next.hymns[hymnKey(service, hymn)] = checked;
            getSelectableVariations(hymn).forEach(variation => {
                next.variations[variationKey(service, hymn, variation)] = checked;
            });
        });
        return next;
    });
}

function toggleHymnSelection(
    setSelection: React.Dispatch<React.SetStateAction<BookletSelectionState>>,
    service: IServiceInfo,
    hymn: IHymnInfo,
    checked: boolean
) {
    setSelection(selection => {
        const next = cloneSelection(selection);
        next.hymns[hymnKey(service, hymn)] = checked;
        getSelectableVariations(hymn).forEach(variation => {
            next.variations[variationKey(service, hymn, variation)] = checked;
        });
        next.services[service.id] = checked || hasSelectedServiceContent(next, service);
        return next;
    });
}

function toggleVariationSelection(
    setSelection: React.Dispatch<React.SetStateAction<BookletSelectionState>>,
    service: IServiceInfo,
    hymn: IHymnInfo,
    variation: BookletVariation,
    checked: boolean
) {
    setSelection(selection => {
        const next = cloneSelection(selection);
        next.variations[variationKey(service, hymn, variation)] = checked;

        if (checked) {
            next.hymns[hymnKey(service, hymn)] = true;
            next.services[service.id] = true;
            return next;
        }

        if (!hasSelectedHymnContent(next, service, hymn)) {
            next.hymns[hymnKey(service, hymn)] = false;
        }

        next.services[service.id] = hasSelectedServiceContent(next, service);
        return next;
    });
}

function cloneSelection(selection: BookletSelectionState): BookletSelectionState {
    return {
        services: { ...selection.services },
        hymns: { ...selection.hymns },
        variations: { ...selection.variations },
        formats: { ...selection.formats }
    };
}

export function getSelectedBookletServices(services: IServiceInfo[], selection: BookletSelectionState, formats: BookletFormatKind[] = bookletFormatKinds): IServiceInfo[] {
    const selectedServices: IServiceInfo[] = [];

    services
        .filter(service => isServiceSelected(selection, service))
        .forEach(service => {
            const selectedHymns: IHymnInfo[] = [];

            (service.hymns || [])
                .filter(hymn => isHymnSelected(selection, service, hymn))
                .forEach(hymn => {
                    const selectedFormats: IFormatInfo[] = [];

                    getBookletFormats(hymn)
                        .filter(format => (selection.formats?.[hymnKey(service, hymn)] ?? formats).includes(formatKindFromId(format.id)))
                        .forEach(format => {
                            const variations = (format.variations || [])
                                .filter(variation => isVariationSelected(selection, service, hymn, { ...variation, formatId: format.id }) &&
                                    hasBookletVariationContent(variation, formatKindFromId(format.id)));

                            if (variations.length > 0) {
                                selectedFormats.push({ ...format, variations, variationCount: variations.length });
                            }
                        });

                    if (selectedFormats.length > 0) {
                        selectedHymns.push({ ...hymn, formats: selectedFormats });
                    }
                });

            if (selectedHymns.length > 0) {
                selectedServices.push({ ...service, hymns: selectedHymns });
            }
        });

    return selectedServices;
}

function isServiceSelected(selection: BookletSelectionState, service: IServiceInfo): boolean {
    return selection.services[service.id] !== false;
}

function isHymnSelected(selection: BookletSelectionState, service: IServiceInfo, hymn: IHymnInfo): boolean {
    return isServiceSelected(selection, service) && selection.hymns[hymnKey(service, hymn)] !== false;
}

function isVariationSelected(
    selection: BookletSelectionState,
    service: IServiceInfo,
    hymn: IHymnInfo,
    variation: BookletVariation
): boolean {
    return isHymnSelected(selection, service, hymn) &&
        selection.variations[variationKey(service, hymn, variation)] !== false;
}

function hasSelectedServiceContent(selection: BookletSelectionState, service: IServiceInfo): boolean {
    return (service.hymns || []).some(hymn => hasSelectedHymnContent(selection, service, hymn));
}

function hasSelectedHymnContent(selection: BookletSelectionState, service: IServiceInfo, hymn: IHymnInfo): boolean {
    if (selection.hymns[hymnKey(service, hymn)] === false) {
        return false;
    }

    const selectableVariations = getSelectableVariations(hymn);
    return selectableVariations.length === 0 ||
        selectableVariations.some(variation => selection.variations[variationKey(service, hymn, variation)] !== false);
}

function getBookletFormats(hymn: IHymnInfo): IFormatInfo[] {
    return [...(hymn.formats || [])]
        .filter(format => ["1", "2", "3", "4"].includes(format.id))
        .sort((a, b) => a.order - b.order);
}

export function getSelectableVariations(hymn: IHymnInfo): BookletVariation[] {
    return getBookletFormats(hymn).flatMap(format =>
        (format.variations || []).map(variation => ({ ...variation, formatId: format.id })));
}

function hymnKey(service: IServiceInfo, hymn: IHymnInfo): string {
    return `${service.seasonId ?? ""}/${service.id}/${hymn.id}`;
}

export function variationKey(service: IServiceInfo, hymn: IHymnInfo, variation: BookletVariation): string {
    return `${hymnKey(service, hymn)}/${variation.formatId}/${variation.id}`;
}

function getVariationDisplayName(variation: BookletVariation): string {
    return variation.displayName || variation.name || variation.id;
}

function formatKindFromId(id: string): BookletFormatKind {
    return id === "4" ? "musical" : id === "1" ? "text" : id === "2" ? "regular" : "vertical";
}

function getFormatName(kind: BookletFormatKind): string {
    return kind === "musical" ? strings.musicalNotesLinkSuffix : kind === "text" ? strings.textFormatName : kind === "regular" ? strings.hazzatFormatName : strings.verticalHazzatFormatName;
}

export function getMissingBookletFormats(services: IServiceInfo[], selection: BookletSelectionState, formats: BookletFormatKind[]): { key: string; label: string }[] {
    return services.flatMap(service => (service.hymns || []).filter(hymn => isHymnSelected(selection, service, hymn)).flatMap(hymn => {
        const requested = selection.formats?.[hymnKey(service, hymn)] ?? formats;
        const available = getSelectedBookletServices([{ ...service, hymns: [hymn] }], selection, formats);
        if (!requested.length) return [{ key: hymnKey(service, hymn), label: `${service.displayName || service.name} / ${hymn.displayName || hymn.name}: ${strings.bookletChooseOneFormat}` }];
        return requested.filter(kind => !getBookletSections(available, [kind]).length).map(kind => ({
            key: `${hymnKey(service, hymn)}/${kind}`,
            label: `${service.displayName || service.name} / ${hymn.displayName || hymn.name}: ${getFormatName(kind)}`
        }));
    }));
}

export default BookletDetails;
