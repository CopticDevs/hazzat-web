import React, { useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ITypeInfo } from "../Providers/HymnsDataProvider/Models/ITypeInfo";
import HymnContentFromType from "./HymnContentFromType";
import LoadingSpinner from "./LoadingSpinner";
import "./SeasonDetails.css";
import TypeSeasonsMenu from "./TypeSeasonsMenu";

function TypeDetails() {
    let { typeId } = useParams();
    const typeIdParam: string = typeId || "";
    const { languageProperties } = useContext(LanguageContext);
    const [typeInfo, setTypeInfo] = useState<ITypeInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const typeResponse = await hymnsDataProvider.getType(typeIdParam);

        if (isMounted.current) {
            setTypeInfo(typeResponse);
            setIsLoading(false);
        }
    }, [typeIdParam, languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${typeInfo?.name} - hazzat.com`;
    }, [isLoading, typeInfo]);

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !!typeInfo ?
                        <div>
                            <div className="pageTitle">{typeInfo.name}</div>

                            <Routes>
                                <Route path="/" element={<TypeSeasonsMenu typeId={typeIdParam} typeName={typeInfo.name} />} />
                                <Route path={`/seasons/:seasonId/hymns/:hymnId/formats/:formatId`} element={<HymnContentFromType typeInfo={typeInfo} />} />
                            </Routes>
                        </div>
                        : null
            }
        </>
    );
}

export default TypeDetails;
