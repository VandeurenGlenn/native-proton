export const jsonStringifyBigInt = (key, value) => (typeof value === 'bigint' ? { $bigint: value.toString() } : value)

export const jsonParseBigInt = (key, value) =>
  typeof value === 'object' && value.$bigint ? BigInt(value.$bigint) : value
