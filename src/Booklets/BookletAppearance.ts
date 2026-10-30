export const bookletColorValues = ["BLACK", "MAROON", "NAVY"] as const;
export type BookletColor = typeof bookletColorValues[number];

/** PDF ink is fixed on white paper, independently of the website theme. */
export const bookletColors = {
    BLACK: { hex: "#000000", rgb: [0, 0, 0] },
    MAROON: { hex: "#800000", rgb: [128 / 255, 0, 0] },
    NAVY: { hex: "#000080", rgb: [0, 0, 128 / 255] }
} as const;

export interface BookletAppearance {
    textColor: BookletColor;
    hazzatColor: BookletColor;
}

export const defaultBookletAppearance: BookletAppearance = { textColor: "BLACK", hazzatColor: "BLACK" };

export function normalizeBookletColor(value: unknown): BookletColor {
    return bookletColorValues.includes(value as BookletColor) ? value as BookletColor : "BLACK";
}
