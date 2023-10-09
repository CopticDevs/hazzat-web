import { useEffect, useState } from "react";
import { StringMap } from "../Types/StringMap";
import "./BottomFormatBar.css";
import FormatOptionMenuItem from "./FormatOptionMenuItem";
import MyNavLink from "./MyNavLink";

interface IFormatItem {
    id: string;
    navLink: string;
}

interface IProps {
    title: string;
    formatsMap: StringMap<string | undefined>;
    activeFormatId?: string;
}

function BottomFormatBar(props: IProps) {
    const [formatList, setFormatsList] = useState<IFormatItem[]>([]);

    useEffect(() => {
        const resultFormatList: IFormatItem[] = [];

        for (let i = 1; i <= 7; i++) {
            const currentLink = props.formatsMap[`${i}`];
            if (currentLink === undefined) continue;

            resultFormatList.push({
                id: `${i}`,
                navLink: currentLink
            });
        }

        setFormatsList(resultFormatList);

    }, [props.formatsMap]);
    
    return (
        <div className="bottom-bar">
            <div className="container">
                <div className="row">
                    {formatList.map((option) => (
                        <div className="col" key={option.id}>
                            <MyNavLink to={option.navLink}>
                                <FormatOptionMenuItem key={option.id}
                                    formatId={option.id}
                                    title={props.title}
                                    fullFormatId={option.navLink}
                                    isActive={props.activeFormatId === option.id ? true : false}
                                />
                            </MyNavLink>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BottomFormatBar;
