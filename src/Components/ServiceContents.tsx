import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnInfo } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { StringMap } from "../Types/StringMap";
import ContentLoadError from "./ContentLoadError";
import CrossDivider from "./CrossDivider";
import FormatOptionsContextMenu from "./FormatOptionsContextMenu";
import HymnRow from "./HymnRow";
import HymnTitle from "./HymnTitle";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";
import "./HymnRow.css";

interface Props { seasonId: string; serviceId: string; serviceName: string }

export default function ServiceContents({ seasonId, serviceId, serviceName }: Props) {
    const { hymnId, formatId } = useParams();
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [hymns, setHymns] = useState<IHymnInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setFailed(false);
        const provider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        provider.getService(seasonId, serviceId).then(service => {
            if (!service) throw new Error("Service not found");
            if (active) setHymns([...(service.hymns ?? [])].sort((a, b) => a.order - b.order));
        }).catch(() => { if (active) setFailed(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [seasonId, serviceId, languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl, retry]);

    if (loading) return <LoadingSpinner />;
    if (failed) return <ContentLoadError retry={() => setRetry(value => value + 1)} />;
    const formatsMap: StringMap<string | undefined> = {};
    for (const hymn of hymns) {
        for (const format of hymn.formats ?? []) formatsMap[format.id] = `/seasons/${seasonId}/services/${serviceId}/formats/${format.id}`;
    }
    const firstLink = Object.keys(formatsMap).sort((a, b) => Number(a) - Number(b)).map(id => formatsMap[id])[0];
    return <div style={{ padding: "7px 3px 7px 3px", marginTop: "30px" }}>
        <div className="contentLinksDiv">
            {firstLink ? <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
                <MyNavLink to={firstLink}><HymnTitle content={serviceName} /></MyNavLink>
                <FormatOptionsContextMenu title={serviceName} formatsMap={formatsMap} />
            </div> : <HymnTitle content={serviceName} />}
        </div>
        {hymns.filter(h => !hymnId || h.id === hymnId).map((hymn, index) => <HymnRow
            key={`${seasonId}/${serviceId}/${hymn.id}`} hymn={hymn} seasonId={seasonId} serviceId={serviceId}
            isAlternate={index % 2 === 1} isExpanded={hymnId === hymn.id} selectedFormatId={formatId} />)}
        <CrossDivider />
    </div>;
}
