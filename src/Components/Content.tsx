import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ReaderContentState } from "../Contexts/ContentViewContext";
import { soundCloudTrackUrl } from "./SoundCloudUrl";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { filterContentLanguages, hasLanguageContent, serializeContentLanguages } from "../ContentLanguages";
import { strings } from "../l8n";
import { IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import ContentAudio from "./ContentAudio";
import ContentHazzat from "./ContentHazzat";
import ContentInformation from "./ContentInformation";
import ContentMusicalNotes from "./ContentMusicalNotes";
import ContentText from "./ContentText";
import ContentVerticalHazzat from "./ContentVerticalHazzat";
import ContentVideo from "./ContentVideo";
import LoadingSpinner from "./LoadingSpinner";
import ContentLoadError from "./ContentLoadError";

interface IProps {
    formatId: string;
    hymnTitle?: string;
    variationsCallback: () => Promise<IVariationInfo<any>[]>;
    onContentState?: (state: ReaderContentState, combination: string) => void;
}

/** Match content that the selected renderer can actually display, not format metadata. */
function hasReaderContent(formatId: string, content: any): boolean {
    if (!content) return false;
    const populated = (fields: string[]) => fields.some(field => typeof content[field] === "string" && content[field].trim());
    switch (formatId) {
        case "1": return Array.isArray(content.paragraphs) && hasLanguageContent(content);
        case "2": return populated(["englishHazzat", "copticHazzat", "arabicHazzat"]);
        case "3": return populated(["englishVerticalHazzat", "copticVerticalHazzat", "arabicVerticalHazzat"]);
        case "4": return populated(["musicXml"]);
        case "5": return !!soundCloudTrackUrl(content.audioFilePath || "");
        case "6": return populated(["englishVideo", "copticVideo", "arabicVideo"]);
        case "7": return populated(["englishInformation", "arabicInformation"]);
        default: return false;
    }
}

function Content({ formatId, hymnTitle, variationsCallback, onContentState }: IProps) {
    const { userSettings } = useContext(UserSettingsContext);
    const [retry, setRetry] = useState(0);
    // Keep data and request identity together: a new route/callback must never report
    // the previous request's result during the render before its effect starts.
    const request = useMemo(() => ({ variationsCallback, formatId, hymnTitle, retry }), [variationsCallback, formatId, hymnTitle, retry]);
    const [result, setResult] = useState<{ request: typeof request; variations?: IVariationInfo<any>[]; failed?: boolean }>();
    const current = result?.request === request ? result : undefined;
    const sourceVariations = current?.variations ?? [];
    const variations = sourceVariations.map(variation => ({ ...variation, content: filterContentLanguages(variation.content, userSettings.contentLanguages) }))
        .filter(variation => hasLanguageContent(variation.content));
    const [renderedScore, setRenderedScore] = useState<typeof request>();
    const onScoreRendered = useCallback(() => setRenderedScore(request), [request]);
    useEffect(() => {
        let active = true;
        // Promise.resolve also isolates a synchronous loader error.
        Promise.resolve().then(variationsCallback).then(response => {
            if (active) setResult({ request, variations: response });
        }).catch(() => { if (active) setResult({ request, failed: true }); });
        return () => { active = false; };
    }, [request, variationsCallback]);
    const combination = serializeContentLanguages(userSettings.contentLanguages);
    const sourceAvailable = sourceVariations.some(variation => hasReaderContent(formatId, variation.content));
    const selectedAvailable = variations.some(variation => hasReaderContent(formatId, variation.content));
    useEffect(() => {
        if (!current || current.failed) return;
        if (!sourceAvailable) onContentState?.('empty', combination);
        else if (!selectedAvailable) onContentState?.('no_selected_language_content', combination);
        else if (formatId !== "4" || renderedScore === request) onContentState?.('available', combination);
    }, [current, sourceAvailable, selectedAvailable, formatId, renderedScore, request, onContentState, combination]);
    if (!current) return <LoadingSpinner />;
    if (current.failed) return <ContentLoadError retry={() => setRetry(value => value + 1)} />;
    if (!variations.length && sourceVariations.length) return <section><h3>{hymnTitle}</h3><p role="status">{strings.noSelectedLanguageContent}</p></section>;
    switch (formatId) {
        case "1": return <ContentText variations={variations} hymnTitle={hymnTitle} />;
        case "2": return <ContentHazzat variations={variations} hymnTitle={hymnTitle} />;
        case "3": return <ContentVerticalHazzat variations={variations} hymnTitle={hymnTitle} />;
        case "4": return <ContentMusicalNotes variations={variations} hymnTitle={hymnTitle} onRendered={onScoreRendered} />;
        case "5": return <ContentAudio variations={variations} hymnTitle={hymnTitle} />;
        case "6": return <ContentVideo variations={variations} hymnTitle={hymnTitle} />;
        case "7": return <ContentInformation variations={variations} hymnTitle={hymnTitle} />;
        default: return <div />;
    }
}

export default Content;
