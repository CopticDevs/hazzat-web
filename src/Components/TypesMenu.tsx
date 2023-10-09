import React, { useContext, useEffect, useRef, useState } from "react";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { ITypeInfo } from "../Providers/HymnsDataProvider/Models/ITypeInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import { convertNumberToString } from "../Utils/LangUtils";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

function TypesMenu() {
    const { languageProperties } = useContext(LanguageContext);
    const [typeList, setTypeList] = useState<ITypeInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchTypes = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName);
        const types = await hymnsDataProvider.getTypeList();

        if (isMounted.current) {
            setTypeList(types.sort(HymnUtils.typeInfoComparer));
            setIsLoading(false);
        }
    }, [languageProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        document.title = strings.types + " - hazzat.com";
        fetchTypes();

        return () => {
            isMounted.current = false;
        };
    }, [fetchTypes]);

    const getColContent = (list: ITypeInfo[], colNum: number) => {
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
            <div className="pageTitle"><LocalizedMessage of="types" /></div>
            {
                isLoading ? <LoadingSpinner /> :
                    typeList && typeList.length > 0 ?
                        <div className="container">
                            <div className="row">
                                <div className="col-sm-6">
                                    {getColContent(typeList, 1)}
                                </div>
                                <div className="col-sm-6">
                                    {getColContent(typeList, 2)}
                                </div>
                            </div>
                        </div>
                        :
                        <div><LocalizedMessage of="noTypes" /></div>
            }
        </div>
    );
}

export default TypesMenu;
