import { StringMap } from "../Types/StringMap";
/** All format controls use the canonical IDs, independently of object insertion order. */
export function getFormatLinks(formatsMap: StringMap<string | undefined>) {
    return Array.from({ length: 7 }, (_, index) => String(index + 1))
        .filter(id => formatsMap[id] !== undefined)
        .map(id => ({ id, navLink: formatsMap[id]! }));
}
