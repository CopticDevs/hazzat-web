const serviceIdRegEx: string = "^/seasons/[0-9]+/services/([0-9]+)$";
const hymnIdRegEx: string = "^/seasons/[0-9]+/services/[0-9]+/hymns/([0-9]+)$";
const formatIdRegEx: string = "^/seasons/[0-9]+/services/[0-9]+/hymns/[0-9]+/formats/([0-9]+)$";
const typeSeasonIdRegEx: string = "^/types/[0-9]+/seasons/([0-9]+)$";
const typeSeasonHymnIdRegEx: string = "^/types/[0-9]+/seasons/[0-9]+/hymns/([0-9]+)$";
const typeSeasonHymnFormatIdRegex: string = "^/types/[0-9]+/seasons/[0-9]+/hymns/[0-9]+/formats/([0-9]+)$";

/**
 * Extracts the typeSeason number from the full id.
 * @param fullId Service ID. Eg: /types/17/seasons/15
 * @returns Service number
 */
export function getTypeSeasonNumberFromId(fullId: string): string {
    const expression = new RegExp(typeSeasonIdRegEx, "i");

    if (!fullId || !expression.test(fullId)) {
        return "";
    }

    const match = expression.exec(fullId);
    if (match === null) {
        return "";
    }

    return match[1];
}

/**
 * Extracts the service number from the full service id.
 * @param fullServiceId Service ID. Eg: /seasons/1/services/15
 * @returns Service number
 */
export function getServiceNumberFromId(fullServiceId: string): string {
    const expression = new RegExp(serviceIdRegEx, "i");

    if (!fullServiceId || !expression.test(fullServiceId)) {
        return "";
    }

    const match = expression.exec(fullServiceId);
    if (match === null) {
        return "";
    }
    
    return match[1];
}

export function getHymnNumberFromId(fullHymnId: string): string {
    const expression = new RegExp(hymnIdRegEx, "i");

    if (!fullHymnId || !expression.test(fullHymnId)) {
        return "";
    }

    const match = expression.exec(fullHymnId);
    if (match === null) {
        return "";
    }

    return match[1];
}

export function getTypeSeasonHymnNumberFromId(fullHymnId: string): string {
    const expression = new RegExp(typeSeasonHymnIdRegEx, "i");

    if (!fullHymnId || !expression.test(fullHymnId)) {
        return "";
    }

    const match = expression.exec(fullHymnId);
    if (match === null) {
        return "";
    }

    return match[1];
}

export function getFormatNumberFromId(fullFormatId: string): string {
    const expression = new RegExp(formatIdRegEx, "i");

    if (!fullFormatId || !expression.test(fullFormatId)) {
        return "";
    }

    const match = expression.exec(fullFormatId);
    if (match === null) {
        return "";
    }

    return match[1];
}

export function getTypeSeasonHymnFormatNumberFromId(fullFormatId: string): string {
    const expression = new RegExp(typeSeasonHymnFormatIdRegex, "i");

    if (!fullFormatId || !expression.test(fullFormatId)) {
        return "";
    }

    const match = expression.exec(fullFormatId);
    if (match === null) {
        return "";
    }

    return match[1];
}