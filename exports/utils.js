const jsonStringifyBigInt = (key, value) => (typeof value === 'bigint' ? { $bigint: value.toString() } : value);
const jsonParseBigInt = (key, value) => typeof value === 'object' && value.$bigint ? BigInt(value.$bigint) : value;

export { jsonParseBigInt, jsonStringifyBigInt };
