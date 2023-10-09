import { String as TsString } from 'typescript-string-operations';

export function stringFormat(format: string, ...args: any[]): string {
    const result = TsString.Format(format, ...args);
    if (result === TsString.Empty) {
        return format;
    }
    return result;
}
