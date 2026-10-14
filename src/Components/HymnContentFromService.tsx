import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { IServiceInfo } from "../Providers/HymnsDataProvider/Models/IServiceInfo";
import { StringMap } from "../Types/StringMap";
import BreadCrumb from "./BreadCrumb";
import Content from "./Content";
import ContentLoadError from "./ContentLoadError";
import ContentPageSettingPane from "./ContentPageSettingPane";
import FormatBar from "./FormatBar";
import InvalidAddressMessage from "./InvalidAddressMessage";
import LoadingSpinner from "./LoadingSpinner";

export default function HymnContentFromService({ seasonInfo }: { seasonInfo: ISeasonInfo }) {
    const { seasonId = "", serviceId = "", hymnId, formatId = "" } = useParams();
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [service, setService] = useState<IServiceInfo>();
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setFailed(false);
        const provider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        provider.getService(seasonId, serviceId).then(response => {
            if (active) setService(response);
        }).catch(() => { if (active) setFailed(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [seasonId, serviceId, languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl, retry]);

    const formatNames = [strings.textFormatName, strings.hazzatFormatName, strings.verticalHazzatFormatName,
        strings.musicFormatName, strings.audioFormatName, strings.videoFormatName, strings.informationFormatName];
    const formatName = /^[1-7]$/.test(formatId) ? formatNames[Number(formatId) - 1] : undefined;
    const hymns = [...(service?.hymns ?? [])].sort((a, b) => a.order - b.order);
    const selectedHymn = hymnId ? hymns.find(h => h.id === hymnId) : undefined;
    const title = selectedHymn?.displayName ?? service?.displayName;
    useEffect(() => {
        document.title = loading || !service ? "hazzat.com" : `${seasonInfo.displayName} - ${service.displayName}${selectedHymn ? `: ${selectedHymn.displayName}` : ""} (${formatName}) - hazzat.com`;
    }, [loading, service, selectedHymn, seasonInfo.displayName, formatName]);

    if (loading) return <LoadingSpinner />;
    if (failed) return <ContentLoadError retry={() => setRetry(value => value + 1)} />;
    if (!service || !formatName || (hymnId && !selectedHymn)) return <InvalidAddressMessage />;

    const shownHymns = hymnId ? [selectedHymn!] : hymns;
    const formatsMap: StringMap<string | undefined> = {};
    for (const hymn of shownHymns) {
        for (const format of hymn.formats ?? []) {
            formatsMap[format.id] = `/seasons/${seasonId}/services/${serviceId}${hymnId ? `/hymns/${hymnId}` : ""}/formats/${format.id}`;
        }
    }
    if (hymnId && !formatsMap[formatId]) return <InvalidAddressMessage />;

    return <>
        <BreadCrumb items={[
            { title: strings.seasons, path: "/Seasons" },
            { title: seasonInfo.displayName, path: `/Seasons/${seasonId}` },
            { title: selectedHymn ? `${service.displayName}: ${selectedHymn.displayName}` : service.displayName }
        ]} />
        <FormatBar title={title ?? service.displayName} formatsMap={formatsMap} activeFormatId={formatId} />
        {shownHymns.map(hymn => {
            const format = hymn.formats?.find(f => f.id === formatId);
            return format ? <Content key={`${seasonId}/${serviceId}/${hymn.id}/${formatId}`} formatId={formatId}
                hymnTitle={hymn.displayName} variationsCallback={async () => format.variations ?? []} /> : null;
        })}
        <ContentPageSettingPane />
    </>;
}
