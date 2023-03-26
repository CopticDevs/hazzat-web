import LocalizedMessage from "../LocalizedMessage";
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
    variations: IVariationInfo<any>[];
}

function Content(props: IProps) {

    let contentControl: JSX.Element;

    switch (props.formatId) {
        case "1":
            contentControl = <ContentText variations={props.variations} />;
            break;
        case "2":
            contentControl = <ContentHazzat variations={props.variations} />;
            break;
        case "3":
            contentControl = <ContentVerticalHazzat variations={props.variations} />;
            break;
        case "4":
            contentControl = <ContentMusicalNotes variations={props.variations} />;
            break;
        case "5":
            contentControl = <ContentAudio variations={props.variations} />;
            break;
        case "6":
            contentControl = <ContentVideo variations={props.variations} />;
            break;
        case "7":
            contentControl = <ContentInformation variations={props.variations} />;
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
    
    return (contentControl);
}

export default Content;
