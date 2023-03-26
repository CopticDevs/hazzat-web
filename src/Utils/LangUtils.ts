import { strings } from "../l8n";

export function convertNumberToString(theNumber: number, lang: string): string {
    if (lang.toUpperCase() === "AR") {
        let numStr = `${theNumber}`;
        numStr = numStr.replace("0", strings.numeric0);
        numStr = numStr.replace("1", strings.numeric1);
        numStr = numStr.replace("2", strings.numeric2);
        numStr = numStr.replace("3", strings.numeric3);
        numStr = numStr.replace("4", strings.numeric4);
        numStr = numStr.replace("5", strings.numeric5);
        numStr = numStr.replace("6", strings.numeric6);
        numStr = numStr.replace("7", strings.numeric7);
        numStr = numStr.replace("8", strings.numeric8);
        numStr = numStr.replace("9", strings.numeric9);
        return numStr;
    }

    return `${theNumber}`;
}
