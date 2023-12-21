import React, { useContext, useEffect, useRef, useState } from "react";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IBookletInfo } from "../Providers/HymnsDataProvider/Models/IBookletInfo";
import { HymnUtils } from "../Providers/HymnsDataProvider/Utils/HymnUtils";
import "./BookletsMenu.css";
import LoadingSpinner from "./LoadingSpinner";
import MyNavLink from "./MyNavLink";

function BookletsMenu() {
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [bookletList, setBookletList] = useState<IBookletInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchBooklets = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl);
        const booklets = await hymnsDataProvider.getBookletList();

        if (isMounted.current) {
            setBookletList(booklets.sort(HymnUtils.bookletInfoComparer));
            setIsLoading(false);
        }
    }, [languageProperties, environmentProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        document.title = strings.booklets + " - hazzat.com";
        fetchBooklets();

        return () => {
            isMounted.current = false;
        };
    }, [fetchBooklets]);
    
    return (
        <div>
            <div className="pageTitle"><LocalizedMessage of="booklets" /></div>
            {
                isLoading ? <LoadingSpinner /> :
                    bookletList && bookletList.length > 0 ?
                        <div className="container" style={{ paddingTop: "40px" }}>
                            <div className="row">
                                {bookletList.map((booklet) => {
                                    return (
                                        <div key={booklet.id} className="col-sm-4 bookletDiv">
                                            <MyNavLink to={`${booklet.id}`}>
                                                <img src={booklet.thumbnailPath} alt={booklet.name} width="100px" height="155px" /><br />
                                                {booklet.name}
                                            </MyNavLink>
                                        </div>)
                                })}
                            </div>
                        </div>
                        :
                        <div><LocalizedMessage of="noBooklets" /></div>
            }
        </div>
    );
}

export default BookletsMenu;
