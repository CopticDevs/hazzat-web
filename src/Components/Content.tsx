import { useContext, useEffect, useState } from "react";
import { UserSettingsContext } from "../Contexts/UserSettingsContext";
import { filterContentLanguages, hasLanguageContent } from "../ContentLanguages";
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
}

function Content({ formatId, hymnTitle, variationsCallback }: IProps) {
    const [sourceVariations, setVariations] = useState<IVariationInfo<any>[]>([]);
    const { userSettings } = useContext(UserSettingsContext);
    const variations = sourceVariations.map(variation => ({ ...variation, content: filterContentLanguages(variation.content, userSettings.contentLanguages) }))
        .filter(variation => hasLanguageContent(variation.content));
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setFailed(false);
        variationsCallback().then(response => {
            if (active) setVariations(response);
        }).catch(() => { if (active) setFailed(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [variationsCallback, formatId, hymnTitle, retry]);
    if (loading) return <LoadingSpinner />;
    if (failed) return <ContentLoadError retry={() => setRetry(value => value + 1)} />;
    if (!variations.length && sourceVariations.length) return <section><h3>{hymnTitle}</h3><p role="status">{strings.noSelectedLanguageContent}</p></section>;
    switch (formatId) {
        case "1": return <ContentText variations={variations} hymnTitle={hymnTitle} />;
        case "2": return <ContentHazzat variations={variations} hymnTitle={hymnTitle} />;
        case "3": return <ContentVerticalHazzat variations={variations} hymnTitle={hymnTitle} />;
        case "4": return <ContentMusicalNotes variations={variations} hymnTitle={hymnTitle} />;
        case "5": return <ContentAudio variations={variations} hymnTitle={hymnTitle} />;
        case "6": return <ContentVideo variations={variations} hymnTitle={hymnTitle} />;
        case "7": return <ContentInformation variations={variations} hymnTitle={hymnTitle} />;
        default: return <div />;
    }
}

export default Content;
