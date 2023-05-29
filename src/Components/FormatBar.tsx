import { useEffect, useState } from "react";
import { StringMap } from "../Types/StringMap";
import FormatOptionMenuItem from "./FormatOptionMenuItem";
import MyNavLink from "./MyNavLink";
import "./FormatBar.css";
interface IFormatItem {
    id: string;
    navLink: string;
}

interface IProps {
    title: string;
    formatsMap: StringMap<string | undefined>;
    activeFormatId?: string;
}

function FormatBar(props: IProps) {
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
        <div className="container">
            <div className="row format-bar">
                {formatList.map((option) => {
                    const isActive = props.activeFormatId === option.id;
                    const menuItem = <FormatOptionMenuItem key={option.id}
                        formatId={option.id}
                        title={props.title}
                        fullFormatId={option.navLink}
                        isActive={isActive}
                    />;
                    return (
                        <div className="col" key={option.id} style={{ minWidth: "150px" }}>
                            {isActive ? menuItem :
                                <MyNavLink to={option.navLink}>
                                    {menuItem}
                                </MyNavLink>}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default FormatBar;
