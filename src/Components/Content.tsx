import React, { useEffect, useRef, useState } from "react";
import LocalizedMessage from "../LocalizedMessage";
import { IFormatInfo } from "../Providers/HymnsDataProvider/Models/IFormatInfo";
import { IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import ContentAudio from "./ContentAudio";
import ContentHazzat from "./ContentHazzat";
import ContentInformation from "./ContentInformation";
import ContentMusicalNotes from "./ContentMusicalNotes";
import ContentText from "./ContentText";
import ContentVerticalHazzat from "./ContentVerticalHazzat";
import ContentVideo from "./ContentVideo";
import MyNavLink from "./MyNavLink";

interface IProps {
    formatId: string;
    variationsCallback: () => Promise<IVariationInfo<any>[]>;
    formatCallbackInfo?: {
        formatListCallback: () => Promise<IFormatInfo[]>;
        handleFoundFormat: (formatId: string) => void;
    }
}

function Content(props: IProps) {
    const [variations, setVariations] = useState<IVariationInfo<any>[]>([]);
    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        // get variations
        if (!props.variationsCallback) {
            return;
        }

        const variationsResponse: IVariationInfo<any>[] = await props.variationsCallback();
        if (props.formatCallbackInfo) {

            const formatListResponse = await props.formatCallbackInfo.formatListCallback();

            formatListResponse.forEach((formatInfo) => {
                props.formatCallbackInfo?.handleFoundFormat(formatInfo.id);
            });
        }

        if (isMounted.current) {
            setVariations(variationsResponse);
        }

    }, [props, isMounted]);

    useEffect(() => {
        isMounted.current = true;
        fetchFromBackend();

        return () => {
            isMounted.current = false;
        };
    }, [fetchFromBackend]);

    if (!isMounted.current) {
        return (<div />)
    }

    let contentControl: JSX.Element;

    switch (props.formatId) {
        case "1":
            contentControl = <ContentText variations={variations} />;
            break;
        case "2":
            contentControl = <ContentHazzat variations={variations} />;
            break;
        case "3":
            contentControl = <ContentVerticalHazzat variations={variations} />;
            break;
        case "4":
            contentControl = <ContentMusicalNotes variations={variations} />;
            break;
        case "5":
            contentControl = <ContentAudio variations={variations} />;
            break;
        case "6":
            contentControl = <ContentVideo variations={variations} />;
            break;
        case "7":
            contentControl = <ContentInformation variations={variations} />;
            break;
        default:
            contentControl = <>
                <div style={{ textAlign: "center", paddingTop: "30px", paddingBottom: "30px" }}>
                    <LocalizedMessage of="contentNotFoundMessage" /><br /><br />
                    <MyNavLink to="#" onClick={() => window.history.back()}>
                        <LocalizedMessage of="goBack" />
                    </MyNavLink>
                </div>
            </>
    }

    if (!isMounted.current) {
        return (<div />)
    }
    
    return (contentControl);
}

export default Content;
