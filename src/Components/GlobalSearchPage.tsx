import { useContext } from "react";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import GlobalSearch from "./GlobalSearch";

function GlobalSearchPage() {
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);

    const dataProvider = new HymnsDataProvider(
        languageProperties.localeName,
        environmentProperties.baseUrl,
        environmentProperties.cloudFrontUrl
    );

    return <GlobalSearch dataProvider={dataProvider} />;
}

export default GlobalSearchPage;
