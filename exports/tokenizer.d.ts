export type Token = {
    type: string;
    optional: boolean;
    key: string;
    minimumLength: number;
    defaultValue: any;
};
export declare const tokenize: (key: string, value: any) => Token;
export declare const getTokens: (proto: object) => Token[];
