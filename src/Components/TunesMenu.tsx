import React, { useContext, useEffect, useRef, useState } from "react";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ITuneInfo } from "../Providers/HymnsDataProvider/Models/ITuneInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { convertNumberToString } from "../Utils/LangUtils";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

function TunesMenu() {
    const { languageProperties } = useContext(LanguageContext);
    const [tuneList, setTuneList] = useState<ITuneInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchTunes = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const tunes = await hymnsDataProvider.getTuneList();

        if (isMounted.current) {
            setTuneList(tunes.sort(HymnUtils.tuneInfoComparer));
            setIsLoading(false);
        }
    }, [languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        document.title = strings.tunes + " - hazzat.com";
        fetchTunes();

        return () => {
            isMounted.current = false;
        };
    }, [fetchTunes]);

    const getColContent = (list: ITuneInfo[], colNum: number) => {
        const midPoint = Math.ceil(list.length / 2);
        const startIdx = (colNum === 1) ? 0 : midPoint;
        const endIdx = (colNum === 1) ? midPoint : list.length;
        const result: JSX.Element[] = [];

        for (let i = startIdx; i < endIdx; i++) {
            result.push(
                <div key={list[i].id}>
                    <MyNavLink to={`${list[i].id}`}>{`${list[i].name} (${convertNumberToString(list[i].hymnCount, languageProperties.localeName)})`}</MyNavLink>
                </div>);
        }

        return result;
    }
    
    return (
        <div>
            <div className="pageTitle"><LocalizedMessage of="tunes" /></div>
            {
                isLoading ? <LoadingSpinner /> :
                    tuneList && tuneList.length > 0 ?
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-6">
                                    {getColContent(tuneList, 1)}
                                </div>
                                <div className="col-sm-6">
                                    {getColContent(tuneList, 2)}
                                </div>
                            </div>
                        </div>
                        :
                        <div><LocalizedMessage of="noTunes" /></div>
            }
        </div>
    );
}

export default TunesMenu;
