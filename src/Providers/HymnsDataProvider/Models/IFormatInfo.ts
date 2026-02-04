import { IVariationInfo } from "./IVariationInfo";

/*
 * Format Info
 */
export interface IFormatInfo {
    id: string;
    name: string;
    order: number;
    variationCount: number;
    variations?: IVariationInfo<any>[]; // NEW: Embedded variations from S3 backend (optional for backward compatibility)
}
