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
    hasBookletVariationContent,
    filterBookletServicesLanguages
} from "../Booklets/BookletPdfGenerator";
import ContentLanguageChoices from "./ContentLanguageChoices";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { BookletAppearance, bookletColors, bookletColorValues, normalizeBookletColor } from "../Booklets/BookletAppearance";
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
    const { userSettings } = useContext(UserSettingsContext);
    const [seasonInfo, setSeasonInfo] = useState<ISeasonInfo | undefined>();
    const [allServices, setServices] = useState<IServiceInfo[]>([]);
    const [languages, setLanguages] = useState(() => [...userSettings.contentLanguages]);
    const languagesRef = useRef(languages);
    languagesRef.current = languages;
    const services = React.useMemo(() => filterBookletServicesLanguages(allServices, languages), [allServices, languages]);
    const [selection, setSelection] = useState<BookletSelectionState>(createEmptySelection());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeDownload, setActiveDownload] = useState<string | undefined>();
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [formats, setFormats] = useState<BookletFormatKind[]>(["text", "regular"]);
    const [grouping, setGrouping] = useState<BookletGroupingKind>("hymn");
    const [layout, setLayout] = useState<BookletLayoutKind>("display");
    const [preview, setPreview] = useState<{ url: string; name: string }>();
    const [appearance, setAppearance] = useState<BookletAppearance>(() => ({
        textColor: normalizeBookletColor(userSettings.contentFontColor), hazzatColor: normalizeBookletColor(userSettings.hazzatFontColor)
    }));
    const [lastPresetId, setLastPresetId] = useState("text-regular");

    const isMounted = useRef(true);
    const requestId = useRef(0);
    const [loadFailed, setLoadFailed] = useState(false);
    const selectedServices = React.useMemo(() => getSelectedBookletServices(services, selection, formats), [services, selection, formats]);
    const sections = React.useMemo(() => getBookletSections(selectedServices, bookletFormatKinds, grouping), [selectedServices, grouping]);
    const availableFormats = React.useMemo(() => bookletFormatKinds.filter(kind => hasBookletFormat(services, kind)), [services]);
    const selectableChoices = React.useMemo(() => services.flatMap(service => (service.hymns || []).flatMap(hymn =>
        getSelectableVariations(hymn).filter(variation => hasBookletVariationContent(variation, formatKindFromId(variation.formatId)))
            .map(variation => ({ key: variationKey(service, hymn, variation), kind: formatKindFromId(variation.formatId) })))), [services]);
    const selectedSignature = React.useMemo(() => JSON.stringify(selectedServices.flatMap(service => (service.hymns || []).flatMap(hymn =>
        getSelectableVariations(hymn).map(variation => variationKey(service, hymn, variation)))).sort()), [selectedServices]);

    useEffect(() => {
        setPreview(undefined);
    }, [selection, formats, grouping, layout, appearance, languages]);

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
                const localized = filterBookletServicesLanguages(sorted, languagesRef.current);
                const available = bookletFormatKinds.filter(kind => hasBookletFormat(localized, kind));
                const preferred = available.filter(kind => kind === "text" || kind === "regular");
                setFormats(preferred.length ? preferred : available.slice(0, 1));
                setLastPresetId((preferred.length ? preferred : available.slice(0, 1)).join("-"));
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
        if (!selectedKinds.length) return;
        setActiveDownload(downloadKey);
        setErrorMessage(undefined);

        try {
            const pdfBytes = await generateSeasonBookletPdf({
                season: seasonInfo,
                localeName: languageProperties.localeName,
                services: selected,
                formatKinds: selectedKinds,
                groupingKind: grouping,
                layoutKind: layout,
                appearance,
                languages
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

    const busy = !!activeDownload;
    const presets: { kinds: BookletFormatKind[]; label: string; id?: string }[] = [
        { kinds: ["text"], label: strings.bookletTextOnly },
        { kinds: ["regular"], label: strings.hazzatFormatName },
        { kinds: ["vertical"], label: strings.verticalHazzatFormatName },
        { kinds: ["musical"], label: strings.musicalNotesLinkSuffix },
        { kinds: ["text", "regular"], label: strings.bookletTextHazzat },
        { kinds: ["text", "vertical"], label: strings.bookletTextVerticalHazzat },
        { kinds: availableFormats, label: strings.bookletAllFormats, id: "all" }
    ];
    const availablePresets = presets.filter(preset => preset.kinds.length > 0 && preset.kinds.every(kind => availableFormats.includes(kind)))
        .map(preset => ({ ...preset, id: preset.id || preset.kinds.join("-") }));
    const matchingPresets = selectedSignature === "[]" ? [] : availablePresets.filter(preset =>
        JSON.stringify(selectableChoices.filter(choice => preset.kinds.includes(choice.kind)).map(choice => choice.key).sort()) === selectedSignature);
    const matchingPreset = matchingPresets.find(preset => preset.id === lastPresetId) || matchingPresets[0];
    const startingPreset = availablePresets.find(preset => preset.id === lastPresetId);
    const colorName = (color: string) => color === "MAROON" ? strings.maroon : color === "NAVY" ? strings.navy : strings.black;
    const applyFormats = (next: BookletFormatKind[], presetId?: string) => {
        setFormats(next);
        if (presetId) setLastPresetId(presetId);
        setSelection(current => {
            const nextSelection = createDefaultSelection(services);
            return presetId ? nextSelection : { ...current, formats: {}, variations: nextSelection.variations };
        });
    };

    return (
        <div>
            <h1 className="pageTitle">{pageTitle}</h1>

            <BreadCrumb items={[
                { title: strings.booklets, path: "/Booklets" },
                { title: seasonInfo.displayName }]} />

            {errorMessage && <div role="alert" className="alert alert-danger">{errorMessage}</div>}

            <div className="container bookletBuilder">
                <h2>{strings.buildBooklet}</h2>
                <p>{strings.buildBookletDescription}</p>
                <fieldset disabled={busy}>
                <legend>{strings.bookletPresetHeading}</legend>
                <div className="bookletPresetRow">
                    {availablePresets.map(preset => (
                        <button key={preset.id} type="button" className="bookletChoice"
                            onClick={() => applyFormats(preset.kinds, preset.id)}>
                            {preset.label}
                        </button>
                    ))}
                </div>
                <p className="bookletSelectionStatus" role="status">
                    <strong>{matchingPreset ? strings.formatString(strings.bookletSelectionPreset, matchingPreset.label) : strings.bookletCustomSelection}</strong>
                    {!matchingPreset && startingPreset && <span className="bookletHint">{strings.formatString(strings.bookletStartedWith, startingPreset.label)}</span>}
                </p>
                <div className="bookletFormatChoices">
                    {availableFormats.map(kind => <label key={kind}>
                        <input type="checkbox" checked={formats.includes(kind)} onChange={event =>
                            applyFormats(bookletFormatKinds.filter(k => k === kind ? event.target.checked : formats.includes(k)))} />
                        {getFormatName(kind)}
                    </label>)}
                </div>
                <p className="bookletHint">{strings.bookletFormatsHint}</p>
                <ContentLanguageChoices included={languages} onChange={setLanguages} hint={strings.bookletLanguagesHint} />
                <button type="button" className="bookletChoice" onClick={() => setLanguages([...userSettings.contentLanguages])}>{strings.bookletUseWebsiteLanguages}</button>
                <BookletContentSelector
                    services={services}
                    selection={selection}
                    onSelectionChange={setSelection}
                    formats={formats}
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
                <details className="bookletAppearance">
                    <summary>{strings.bookletAdvancedAppearance}</summary>
                    <div className="bookletColorGroups">
                        {(["textColor", "hazzatColor"] as const).map(field => <fieldset key={field}>
                            <legend>{field === "textColor" ? strings.bookletTextColor : strings.bookletHazzatColor}</legend>
                            <div className="bookletColorChoices">{bookletColorValues.map(color => <label key={color}>
                                <input type="radio" name={`booklet-${field}`} value={color} checked={appearance[field] === color}
                                    onChange={() => setAppearance(previous => ({ ...previous, [field]: color }))} />
                                <span className="bookletColorSwatch" style={{ backgroundColor: bookletColors[color].hex }} aria-hidden="true" />
                                {colorName(color)}
                            </label>)}</div>
                        </fieldset>)}
                    </div>
                    <button type="button" className="bookletChoice" onClick={() => setAppearance({
                        textColor: normalizeBookletColor(userSettings.contentFontColor), hazzatColor: normalizeBookletColor(userSettings.hazzatFontColor)
                    })}>{strings.bookletUseWebsiteColors}</button>
                    <p className="bookletHint">{strings.bookletColorSample}</p>
                    <div className="bookletColorSample" role="img" aria-label={strings.bookletColorSample}>
                        <div className="CopticFont" style={{ color: bookletColors[appearance.textColor].hex }}>P[oic nai nan</div>
                        <div className="HazzatFont" style={{ color: bookletColors[appearance.hazzatColor].hex }}>x c z x c</div>
                        <div style={{ color: bookletColors[appearance.textColor].hex }}>{strings.bookletSampleWords}</div>
                        <div className="bookletSampleComment">{strings.bookletSampleComment}</div>
                    </div>
                    <p className="bookletHint">{strings.bookletColorScope}</p>
                </details>
                <section className="bookletReview" aria-labelledby="bookletReviewTitle">
                    <h3 id="bookletReviewTitle">{strings.bookletAtGlance}</h3>
                    <p aria-live="polite">{selectedServices.reduce((sum, service) => sum + (service.hymns?.length || 0), 0)} {strings.bookletHymnsSelected} · {strings.bookletOnePdf}</p>
                    <details><summary>{strings.bookletContentOrder}</summary>
                        <ol>{sections.map((section, i) => <li key={i}>{section.service.displayName || section.service.name} / {section.hymn.displayName || section.hymn.name} · {getFormatName(section.formatKind)}</li>)}</ol>
                    </details>
                    {!sections.length && <p role="status">{strings.bookletNoSelectedContent}</p>}
                    <button type="button" className="bookletPrimaryAction" disabled={!sections.length} onClick={reviewBooklet}>
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
                                hasBookletVariationContent(variation, formatKindFromId(variation.formatId)));

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

                                    {selectableVariations.length > 0 && (
                                        <div className="bookletVariationSelectorGroup">
                                            {selectableVariations.map(variation => (
                                                <label key={variationKey(service, hymn, variation)} className="bookletVariationSelector">
                                                    <input
                                                        type="checkbox"
                                                        checked={isVariationSelected(props.selection, service, hymn, variation) &&
                                                            (props.selection.formats?.[hymnKey(service, hymn)] ?? props.formats).includes(formatKindFromId(variation.formatId))}
                                                        onChange={event => toggleVariationSelection(props.onSelectionChange, service, hymn, variation, event.target.checked, props.formats)}
                                                    />
                                                    <span>{getVariationDisplayName(variation)} ({getFormatName(formatKindFromId(variation.formatId))})</span>
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
            delete next.formats?.[hymnKey(service, hymn)];
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
        delete next.formats?.[hymnKey(service, hymn)];
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
    checked: boolean,
    defaultFormats: BookletFormatKind[]
) {
    setSelection(selection => {
        const next = cloneSelection(selection);
        const key = hymnKey(service, hymn);
        const kind = formatKindFromId(variation.formatId);
        const hymnWasSelected = isHymnSelected(selection, service, hymn);
        const requested = hymnWasSelected ? selection.formats?.[key] ?? defaultFormats : [];
        if (checked && !hymnWasSelected) {
            getSelectableVariations(hymn).forEach(candidate => { next.variations[variationKey(service, hymn, candidate)] = false; });
        }
        const sameFormat = getSelectableVariations(hymn).filter(candidate => candidate.formatId === variation.formatId &&
            hasBookletVariationContent(candidate, kind));
        if (checked && !requested.includes(kind)) {
            sameFormat.forEach(candidate => { next.variations[variationKey(service, hymn, candidate)] = false; });
        }
        next.variations[variationKey(service, hymn, variation)] = checked;
        const includeFormat = checked || sameFormat.some(candidate => next.variations[variationKey(service, hymn, candidate)] !== false);
        next.formats = { ...next.formats, [key]: bookletFormatKinds.filter(candidate => candidate === kind ? includeFormat : requested.includes(candidate)) };

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
    const requested = selection.formats?.[hymnKey(service, hymn)];
    if (requested && requested.length === 0) return false;
    return selectableVariations.length === 0 ||
        selectableVariations.some(variation => (!requested || requested.includes(formatKindFromId(variation.formatId))) &&
            selection.variations[variationKey(service, hymn, variation)] !== false);
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

export default BookletDetails;
