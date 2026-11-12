import { useContext, useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { ContentViewProvider } from "../Contexts/ContentViewContext";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { ISeasonInfo } from "../Providers/HymnsDataProvider/Models/ISeasonInfo";
import { stringFormat } from "../stringFormat";
import ContentLoadError from "./ContentLoadError";
import HymnContentFromSeasonService from "./HymnContentFromSeasonService";
import HymnContentFromService from "./HymnContentFromService";
import InvalidAddressMessage from "./InvalidAddressMessage";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import ServicesMenu from "./ServicesMenu";

export default function SeasonRouter() {
    const { seasonId = "" } = useParams();
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    // Never reuse a previous season's loaded/invalid state during navigation or a feed change.
    const key = JSON.stringify([seasonId, languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl]);
    return <ContentViewProvider><SeasonRoutes key={key} seasonId={seasonId} /></ContentViewProvider>;
}

function SeasonRoutes({ seasonId }: { seasonId: string }) {
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [season, setSeason] = useState<ISeasonInfo>();
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        setLoading(true);
        setFailed(false);
        const provider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl);
        provider.getSeasonList({ throwOnError: true }).then(seasons => {
            if (active) setSeason(seasons.find(value => value.id === seasonId));
        }).catch(() => { if (active) setFailed(true); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [seasonId, languageProperties.localeName, environmentProperties.baseUrl, environmentProperties.cloudFrontUrl, retry]);
    useEffect(() => {
        document.title = loading ? "hazzat.com" : `${season?.displayName || strings.seasons} - hazzat.com`;
    }, [loading, season]);
    if (loading) return <LoadingSpinner />;
    if (failed) return <ContentLoadError retry={() => setRetry(value => value + 1)} />;
    if (!season) return <InvalidAddressMessage />;
    return <div>
        <h1 className="pageTitle">{stringFormat(strings.seasonTitle, season.displayName)}</h1>
        <Routes>
            <Route path="/" element={<ServicesMenu seasonId={seasonId} seasonName={season.displayName} />} />
            <Route path="services/:serviceId/*" element={<ServiceRoutes season={season} />} />
            <Route path="*" element={<InvalidAddressMessage />} />
        </Routes>
    </div>;
}

function ServiceRoutes({ season }: { season: ISeasonInfo }) {
    const { serviceId = "" } = useParams();
    // Service IDs come from the successfully loaded season catalog, not a failed content request.
    if (!season.serviceIds?.includes(serviceId)) return <InvalidAddressMessage />;
    return <Routes key={serviceId}>
        <Route path="/" element={<ServicesMenu seasonId={season.id} seasonName={season.displayName} />} />
        <Route path="hymns/:hymnId" element={<ServicesMenu seasonId={season.id} seasonName={season.displayName} />} />
        <Route path="hymns/:hymnId/formats/:formatId" element={<HymnContentFromSeasonService seasonInfo={season} />} />
        <Route path="formats/:formatId" element={<HymnContentFromService seasonInfo={season} />} />
        <Route path="*" element={<InvalidAddressMessage />} />
    </Routes>;
}
