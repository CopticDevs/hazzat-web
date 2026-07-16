import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    BookletFormatKind,
    BookletLayoutKind,
    generateSeasonBookletPdf,
    getBookletFileName,
    hasBookletFormat
} from "../Booklets/BookletPdfGenerator";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { ReactComponent as BookletFormatImg } from "../images/bookletFormat.svg";
import { ReactComponent as DisplayFormatImg } from "../images/displayFormat.svg";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { IHymnContent, IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import "./BookletDetails.css";
import BreadCrumb from "./BreadCrumb";
import InvalidAddressMessage from "./InvalidAddressMessage";
import LoadingSpinner from "./LoadingSpinner";

type BookletVariation = IVariationInfo<IHymnContent>;

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

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        const seasonResponse = await hymnsDataProvider.getSeason(seasonIdParam);
        const serviceResponse = seasonResponse ? await hymnsDataProvider.getServiceList(seasonIdParam) : [];

        if (isMounted.current) {
            const sortedServices = [...serviceResponse].sort((a, b) => a.order - b.order);
            setSeasonInfo(seasonResponse);
            setServices(sortedServices);
            setSelection(createDefaultSelection(sortedServices));
            setIsLoading(false);
        }
    }, [seasonIdParam, languageProperties, environmentProperties]);

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

    const downloadBooklet = async (formatKind: BookletFormatKind, layoutKind: BookletLayoutKind) => {
        if (!seasonInfo) {
            return;
        }

        const downloadKey = `${formatKind}-${layoutKind}`;
        setActiveDownload(downloadKey);
        setErrorMessage(undefined);

        try {
            const pdfBytes = await generateSeasonBookletPdf({
                season: seasonInfo,
                services: getSelectedBookletServices(services, selection),
                formatKind,
                layoutKind
            });
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = getBookletFileName(seasonInfo, formatKind, layoutKind);
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error("Failed to generate booklet PDF", error);
            if (isMounted.current) {
                setErrorMessage(strings.bookletDownloadError);
            }
        } finally {
            if (isMounted.current) {
                setActiveDownload(undefined);
            }
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!seasonInfo) {
        return <InvalidAddressMessage />;
    }

    const selectedServices = getSelectedBookletServices(services, selection);
    const regularExists = hasBookletFormat(services, "regular");
    const verticalExists = hasBookletFormat(services, "vertical");
    const regularAvailable = hasBookletFormat(selectedServices, "regular");
    const verticalAvailable = hasBookletFormat(selectedServices, "vertical");

    return (
        <div>
            <div className="pageTitle">{pageTitle}</div>

            <BreadCrumb items={[
                { title: strings.booklets, path: "/Booklets" },
                { title: seasonInfo.displayName }]} />

            <div className="bookletDetailsIntro">
                {seasonInfo.displayVerse && (
                    <div className="bookletSeasonVerse" dangerouslySetInnerHTML={{ __html: seasonInfo.displayVerse }} />
                )}
            </div>

            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <div className="container">
                <BookletContentSelector
                    services={services}
                    selection={selection}
                    onSelectionChange={setSelection}
                />

                <div className="row">
                    <BookletDownloadGroup
                        formatKind="regular"
                        title={strings.hazzatFormatName}
                        available={regularAvailable}
                        disabledMessage={getBookletDisabledMessage(regularExists)}
                        activeDownload={activeDownload}
                        onDownload={downloadBooklet}
                    />
                    <BookletDownloadGroup
                        formatKind="vertical"
                        title={strings.verticalHazzatFormatName}
                        available={verticalAvailable}
                        disabledMessage={getBookletDisabledMessage(verticalExists)}
                        activeDownload={activeDownload}
                        onDownload={downloadBooklet}
                    />
                </div>
            </div>
        </div>
    );
}

interface BookletDownloadGroupProps {
    formatKind: BookletFormatKind;
    title: string;
    available: boolean;
    disabledMessage: string;
    activeDownload?: string;
    onDownload: (formatKind: BookletFormatKind, layoutKind: BookletLayoutKind) => void;
}

function BookletDownloadGroup(props: BookletDownloadGroupProps) {
    const printKey = `${props.formatKind}-print`;
    const displayKey = `${props.formatKind}-display`;
    const isBusy = !!props.activeDownload;

    return (
        <div className="col-lg-6 bookletDownloadGroup">
            <div className="bookletDownloadTitle">{props.title}</div>
            <div className="row">
                <div className="col-sm-6 bookletLinkDiv">
                    <button
                        type="button"
                        className="bookletDownloadButton"
                        disabled={!props.available || isBusy}
                        onClick={() => props.onDownload(props.formatKind, "print")}>
                        <BookletFormatImg title={strings.forPrinting} /><br />
                        <strong>{props.activeDownload === printKey ? strings.generatingBooklet : <LocalizedMessage of="forPrinting" />}</strong><br />
                    </button>
                    {props.available ? <LocalizedMessage of="forPrintingDesc" /> : props.disabledMessage}
                </div>
                <div className="col-sm-6 bookletLinkDiv">
                    <button
                        type="button"
                        className="bookletDownloadButton"
                        disabled={!props.available || isBusy}
                        onClick={() => props.onDownload(props.formatKind, "display")}>
                        <DisplayFormatImg title={strings.forDevices} /><br />
                        <strong>{props.activeDownload === displayKey ? strings.generatingBooklet : <LocalizedMessage of="forDevices" />}</strong><br />
                    </button>
                    {props.available ? <LocalizedMessage of="forDevicesDesc" /> : props.disabledMessage}
                </div>
            </div>
        </div>
    );
}

interface BookletSelectionState {
    services: Record<string, boolean>;
    hymns: Record<string, boolean>;
    variations: Record<string, boolean>;
}

interface BookletContentSelectorProps {
    services: IServiceInfo[];
    selection: BookletSelectionState;
    onSelectionChange: React.Dispatch<React.SetStateAction<BookletSelectionState>>;
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
                            const selectableVariations = getSelectableVariations(hymn);

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
                                                        checked={isVariationSelected(props.selection, service, hymn, variation)}
                                                        onChange={event => toggleVariationSelection(props.onSelectionChange, service, hymn, variation, event.target.checked)}
                                                    />
                                                    {getVariationDisplayName(variation)}
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
        variations: { ...selection.variations }
    };
}

function getSelectedBookletServices(services: IServiceInfo[], selection: BookletSelectionState): IServiceInfo[] {
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
                        .forEach(format => {
                            const variations = (format.variations || [])
                                .filter(variation => isVariationSelected(selection, service, hymn, variation));

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
        .filter(format => format.id === "2" || format.id === "3")
        .sort((a, b) => a.order - b.order);
}

function getSelectableVariations(hymn: IHymnInfo): BookletVariation[] {
    const variations: BookletVariation[] = [];
    const variationKeys = new Set<string>();

    getBookletFormats(hymn).forEach(format => {
        (format.variations || []).forEach(variation => {
            const key = getVariationSelectionKey(variation);
            if (!variationKeys.has(key) && !isFormatOnlyVariationKey(key)) {
                variationKeys.add(key);
                variations.push(variation);
            }
        });
    });

    return variations.length > 1 ? variations : [];
}

function hymnKey(service: IServiceInfo, hymn: IHymnInfo): string {
    return `${service.id}/${hymn.id}`;
}

function variationKey(service: IServiceInfo, hymn: IHymnInfo, variation: BookletVariation): string {
    return `${service.id}/${hymn.id}/${getVariationSelectionKey(variation)}`;
}

function getVariationDisplayName(variation: BookletVariation): string {
    return variation.displayName || variation.name || variation.id;
}

function getVariationSelectionKey(variation: BookletVariation): string {
    return getSelectorTextKey(getVariationDisplayName(variation));
}

function isFormatOnlyVariationKey(key: string): boolean {
    return key === getSelectorTextKey(strings.hazzatFormatName) ||
        key === getSelectorTextKey(strings.verticalHazzatFormatName) ||
        key === "hazzat" ||
        key === "vertical hazzat";
}

function getSelectorTextKey(text: string): string {
    return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function getBookletDisabledMessage(formatExists: boolean): string {
    if (!formatExists) {
        return strings.bookletUnavailable;
    }

    return strings.bookletNoSelectedContent;
}

export default BookletDetails;
