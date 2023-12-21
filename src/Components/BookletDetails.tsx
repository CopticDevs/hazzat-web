import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { EnvironmentContext } from "../Contexts/Environment/EnvironmentContext";
import { ReactComponent as BookletFormatImg } from "../images/bookletFormat.svg";
import { ReactComponent as DisplayFormatImg } from "../images/displayFormat.svg";
import { strings } from "../l8n";
import { LanguageContext } from "../LanguageContext";
import LocalizedMessage from "../LocalizedMessage";
import { HymnsDataProvider } from "../Providers/HymnsDataProvider/HymnsDataProvider";
import { IHymnsDataProvider } from "../Providers/HymnsDataProvider/IHymnsDataProvider";
import { IBookletInfo } from "../Providers/HymnsDataProvider/Models/IBookletInfo";
import "./BookletDetails.css";
import BreadCrumb from "./BreadCrumb";
import LoadingSpinner from "./LoadingSpinner";

function BookletDetails() {
    let { bookletId } = useParams();
    const bookletIdParam: string = bookletId || "";
    const { languageProperties } = useContext(LanguageContext);
    const { environmentProperties } = useContext(EnvironmentContext);
    const [bookletInfo, setBookletInfo] = useState<IBookletInfo | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        setIsLoading(true);
        const hymnsDataProvider: IHymnsDataProvider = new HymnsDataProvider(languageProperties.localeName, environmentProperties.baseUrl);
        const bookletResponse = await hymnsDataProvider.getBooklet(bookletIdParam);

        if (isMounted.current) {
            setBookletInfo(bookletResponse);
            setIsLoading(false);
        }
    }, [bookletIdParam, languageProperties, environmentProperties, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    useEffect(() => {
        document.title = isLoading ? "hazzat.com" : `${bookletInfo?.name} - hazzat.com`;
    }, [isLoading, bookletInfo]);

    return (
        <>
            {
                isLoading ? <LoadingSpinner /> :
                    !!bookletInfo ?
                        <div>
                            <div className="pageTitle">{bookletInfo.name}</div>

                            <BreadCrumb items={[
                                { title: strings.booklets, path: "/Booklets" },
                                { title: bookletInfo.name }]} />

                            <div className="container">
                                <div className="row">
                                    <div className="col-3 col-md-4 bookletFullImgDiv">
                                        <img src={bookletInfo.fullPicturePath} alt={bookletInfo.name} width="214px" height="330px" />
                                    </div>
                                    <div className="col-9 col-md-8">
                                        <div style={{ padding: "15px" }} dangerouslySetInnerHTML={{ __html: bookletInfo.summary }} />
                                    </div>
                                </div>
                            
                                <div className="row">
                                    <div className="col-sm-6 bookletLinkDiv">
                                        <a href={bookletInfo.printPath} target="_blank" rel="noreferrer">
                                            <BookletFormatImg title={strings.forPrinting} /><br />
                                            <strong><LocalizedMessage of="forPrinting" /></strong><br />
                                        </a>
                                        <LocalizedMessage of="forPrintingDesc" />
                                    </div>
                                    <div className="col-sm-6 bookletLinkDiv">
                                        <a href={bookletInfo.displayPath} target="_blank" rel="noreferrer">
                                            <DisplayFormatImg title={strings.forDevices} /><br />
                                            <strong><LocalizedMessage of="forDevices" /></strong><br />
                                        </a>
                                        <LocalizedMessage of="forDevicesDesc" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        : null
            }
        </>
    );
}

export default BookletDetails;
