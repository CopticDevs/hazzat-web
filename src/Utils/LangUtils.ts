import { strings } from "../l8n";

export function convertNumberToString(theNumber: number, lang: string): string {
    if (lang.toUpperCase() === "AR") {
        let numStr = `${theNumber}`;
        numStr = numStr.replace(/0/g, strings.numeric0);
        numStr = numStr.replace(/1/g, strings.numeric1);
        numStr = numStr.replace(/2/g, strings.numeric2);
        numStr = numStr.replace(/3/g, strings.numeric3);
        numStr = numStr.replace(/4/g, strings.numeric4);
        numStr = numStr.replace(/5/g, strings.numeric5);
        numStr = numStr.replace(/6/g, strings.numeric6);
        numStr = numStr.replace(/7/g, strings.numeric7);
        numStr = numStr.replace(/8/g, strings.numeric8);
        numStr = numStr.replace(/9/g, strings.numeric9);
        return numStr;
    }

    return `${theNumber}`;
}
