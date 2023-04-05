import { useEffect, useState } from "react";
import space from "../images/space.gif";
import { StringMap } from "../Types/StringMap";
import FormatLink from "./FormatLink";
import "./HymnRow.css";

export interface IFormatItem {
    id: string;
    navLink: string | undefined;
}

export interface IProps {
    title: string;
    formatsMap: StringMap<string | undefined>;
}

function FormatOptionLinks(props: IProps) {
    const [formatList, setFormatsList] = useState<IFormatItem[]>([]);

    useEffect(() => {
        const resultFormatList: IFormatItem[] = [];

        for (let i = 1; i <= 7; i++) {
            resultFormatList.push({
                id: `${i}`,
                navLink: props.formatsMap[`${i}`]
            });
        }

        setFormatsList(resultFormatList);

    }, [props.formatsMap]);
    
    return (
        <div className="contentLinksDiv">
            <img src={space} style={{ height: "25px", width: "10px", padding: "6px" }} alt="" />
            {formatList.map((item) => 
                <FormatLink key={item.id} formatId={item.id} title={props.title} fullFormatId={item.navLink} />
            )}
            <img src={space} style={{ height: "25px", width: "10px", padding: "6px" }} alt="" />
        </div>
    );
}

export default FormatOptionLinks;
