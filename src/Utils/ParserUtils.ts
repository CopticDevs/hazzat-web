const serviceIdRegEx: string = "^/seasons/[0-9]+/services/([0-9]+)$";

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
