export declare const encode: (proto: object, input: object, compress?: boolean) => Uint8Array;
export declare const decode: (proto: object, uint8Array: Uint8Array, compressed?: boolean) => object;
declare const _default: {
    encode: (proto: object, input: object, compress?: boolean) => Uint8Array;
    decode: (proto: object, uint8Array: Uint8Array, compressed?: boolean) => object;
};
export default _default;
