const tokenCache = new WeakMap();
const tokenize = (key, value) => {
    const optional = key.endsWith('?');
    let type = value === undefined ? key : value;
    if (type instanceof Uint8Array)
        type = 'uint8Array';
    else if (typeof type === 'bigint')
        type = 'bigint';
    else
        type = Array.isArray(type) ? 'array' : typeof type;
    const parts = key.split('?');
    const minimumLength = parts[2]?.includes('min') ? Number(parts[2].split('min:')[1]) : 0;
    return { type, optional, key: parts[0], minimumLength, defaultValue: value };
};
const getTokens = (proto) => {
    if (tokenCache.has(proto))
        return tokenCache.get(proto);
    const keys = Object.keys(proto);
    const values = Object.values(proto);
    const tokens = keys.map((k, i) => tokenize(k, values[i]));
    tokenCache.set(proto, tokens);
    return tokens;
};

export { getTokens, tokenize };
