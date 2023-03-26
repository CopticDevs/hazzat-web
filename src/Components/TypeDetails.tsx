import React, { useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { LanguageContext } from "../LanguageContext";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ITypeInfo } from "../Providers/HymnsDataProvider/Models/ITypeInfo";
import Content from "./Content";
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
                                {/*<Route path={`/Types/:typeId/seasons/:seasonId/formats/:formatId`} element={<Content />} />*/}
                            </Routes>
                        </div>
                        : null
            }
        </>
    );
}

export default TypeDetails;
