import typedArraySmartConcat from '@vandeurenglenn/typed-array-smart-concat';
import typedArraySmartDeconcat from '@vandeurenglenn/typed-array-smart-deconcat';
import typedArrayUtils from '@vandeurenglenn/typed-array-utils';

const { fromString, toString } = typedArrayUtils;
const isJson = (type) => type === 'object' || 'array';
const isString = (type) => type === 'string';
const isNumber = (type) => type === 'number';
const isUint8Array = (type) => type === 'uint8Array';
const tokenize = (key, value) => {
    const optional = key.endsWith('?');
    let type = value;
    type = Array.isArray(type) ? 'array' : typeof type;
    if (value instanceof Uint8Array)
        type = 'uint8Array';
    const parts = key.split('?');
    const minimumLength = parts[2]?.includes('min') ? parts[2].split['min:'][1] : 0;
    return { type, optional, key: parts[0], minimumLength };
};
const encode = (proto, input) => {
    const keys = Object.keys(proto);
    const values = Object.values(proto);
    const set = [];
    for (let i = 0; i < keys.length; i++) {
        const token = tokenize(keys[i], values[i]);
        const data = input[token.key];
        if (!token.optional && data === undefined)
            throw new Error(`requires: ${token.key}`);
        if (token.type !== 'object' && token.minimumLength > data.length || token.type === 'object' && token.minimumLength > Object.keys(data).length)
            throw new Error(`minimumLength for ${token.key} is set to ${token.minimumLength} but got ${data.length}`);
        if (isUint8Array(token.type))
            set.push(data);
        else if (isString(token.type))
            set.push(fromString(data));
        else if (isNumber(token.type))
            set.push(new TextEncoder().encode(data.toString()));
        else if (isJson(token.type))
            set.push(new TextEncoder().encode(JSON.stringify(data)));
    }
    return typedArraySmartConcat(set);
};
const decode = (proto, uint8Array) => {
    let deconcated = typedArraySmartDeconcat(uint8Array);
    const output = {};
    const keys = Object.keys(proto);
    const values = Object.values(proto);
    if (keys.length !== deconcated.length)
        console.warn(`length mismatch: expected  ${keys.length} got ${uint8Array.length}`);
    for (let i = 0; i < keys.length; i++) {
        const token = tokenize(keys[i], values[i]);
        if (isUint8Array(token.type))
            output[token.key] = deconcated[i];
        else if (isString(token.type))
            output[token.key] = toString(deconcated[i]);
        else if (isNumber(token.type))
            output[token.key] = Number(new TextDecoder().decode(deconcated[i]));
        else if (isJson(token.type))
            output[token.key] = JSON.parse(new TextDecoder().decode(deconcated[i]));
        if (!token.optional && output[token.key] === undefined)
            throw new Error(`missing required property: ${token.key}`);
    }
    return output;
};
var index = {
    encode,
    decode
};

export { decode, index as default, encode };
