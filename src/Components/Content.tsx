import React, { useEffect, useRef, useState } from "react";
import { IVariationInfo } from "../Providers/HymnsDataProvider/Models/IVariationInfo";
import ContentAudio from "./ContentAudio";
import ContentHazzat from "./ContentHazzat";
import ContentInformation from "./ContentInformation";
import ContentMusicalNotes from "./ContentMusicalNotes";
import ContentText from "./ContentText";
import ContentVerticalHazzat from "./ContentVerticalHazzat";
import ContentVideo from "./ContentVideo";
import LoadingSpinner from "./LoadingSpinner";

interface IProps {
    formatId: string;
    hymnTitle?: string;
    variationsCallback: () => Promise<IVariationInfo<any>[]>;
}

function Content(props: IProps) {
    const [variations, setVariations] = useState<IVariationInfo<any>[]>([]);
    const [contentControl, setContentControl] = useState<JSX.Element>(<LoadingSpinner />);
    const isMounted = useRef(true);

    const fetchFromBackend = React.useCallback(async () => {
        // get variations
        if (!props.variationsCallback) {
            return;
        }

        const variationsResponse: IVariationInfo<any>[] = await props.variationsCallback();

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

    useEffect(() => {

        let theControl: JSX.Element;

        switch (props.formatId) {
            case "1":
                theControl = <ContentText variations={variations} hymnTitle={props.hymnTitle} />;
                break;
            case "2":
                theControl = <ContentHazzat variations={variations} hymnTitle={props.hymnTitle} />;
                break;
            case "3":
                theControl = <ContentVerticalHazzat variations={variations} hymnTitle={props.hymnTitle} />;
                break;
            case "4":
                theControl = <ContentMusicalNotes variations={variations} hymnTitle={props.hymnTitle} />;
                break;
            case "5":
                theControl = <ContentAudio variations={variations} hymnTitle={props.hymnTitle} />;
                break;
            case "6":
                theControl = <ContentVideo variations={variations} hymnTitle={props.hymnTitle} />;
                break;
            case "7":
                theControl = <ContentInformation variations={variations} hymnTitle={props.hymnTitle} />;
                break;
            default:
                theControl = <div />
        }

        setContentControl(theControl);

    }, [variations, props.formatId, props.hymnTitle]);

    if (!isMounted.current) {
        return (<LoadingSpinner />)
    }
    
    return (contentControl);
}

export default Content;
