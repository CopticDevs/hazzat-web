import React, { useContext, useEffect, useRef, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IHymnInfoWithServiceDetails } from "../Providers/HymnsDataProvider/Models/IHymnInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { getTypeSeasonHymnFormatNumberFromId, getTypeSeasonHymnNumberFromId } from "../Utils/ParserUtils";
import HymnRow from "./HymnRow";
import "./HymnRow.css";
import HymnTitle from "./HymnTitle";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    typeId: string;
    seasonId: string;
    seasonName: string;
}

function TypeSeasonsContents(props: IProps) {
    const { languageProperties } = useContext(LanguageContext);
    const [hymns, setHymnsInfo] = useState<IHymnInfoWithServiceDetails[]>([]);
    const langClassName = languageProperties.isRtl ? "fRight" : "fLeft";

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const hymnsResponse = await hymnsDataProvider.getTypeSeasonServiceHymnList(props.typeId, props.seasonId);

        if (isMounted.current) {
            setHymnsInfo(hymnsResponse.sort(HymnUtils.hymnInfoWithServiceDetailsComparer));
        }
    }, [languageProperties, props.typeId, props.seasonId, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    let alternateHymn = true;

    return (
        <>
            {
                !isMounted.current ? <LoadingSpinner /> :
                    <div style={{ padding: "7px 3px 7px 3px", marginTop: "30px" }}>
                        <div className={langClassName}>
                            <HymnTitle content={props.seasonName} />
                        </div>
                        <div className="clear" />
                        {hymns.map((hymn) => {
                            alternateHymn = !alternateHymn;
                            const hymnId = getTypeSeasonHymnNumberFromId(hymn.id);

                            const getFormatsCallback = () => {
                                const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
                                return hymnsDataProvider.getTypeSeasonServiceHymnFormatList(props.typeId, props.seasonId, hymnId);
                            };

                            return <HymnRow key={hymn.id} hymnName={`${hymn.serviceName}: ${hymn.name}`} isAlternate={alternateHymn} getFormatsCallback={getFormatsCallback} parseFormatIdCallback={getTypeSeasonHymnFormatNumberFromId} />
                        })}
                    </div>
            }
        </>
    );
}

export default TypeSeasonsContents;
