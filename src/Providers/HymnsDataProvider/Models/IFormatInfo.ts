import { IHymnContent, IVariationInfo } from "./IVariationInfo";

/*
 * Format Info
 */
export interface IFormatInfo {
    id: string;
    name: string;
    order: number;
    variationCount: number;
    variations?: IVariationInfo<IHymnContent>[]; // Embedded variations from S3 backend.
}
