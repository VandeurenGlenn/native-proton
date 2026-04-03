import typedArraySmartConcat from '@vandeurenglenn/typed-array-smart-concat'
import pako from 'pako'
import { jsonStringifyBigInt } from './utils.js'
import { getTokens } from './tokenizer.js'

const encoder = new TextEncoder()

export const toType = (data: bigint | number | string | Uint8Array | ArrayBuffer | object | []): Uint8Array => {
  if (data instanceof Uint8Array) return data
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (typeof data === 'bigint') return encoder.encode(data.toString())
  if (typeof data === 'string') return encoder.encode(data)
  if (typeof data === 'object') return encoder.encode(JSON.stringify(data, jsonStringifyBigInt))
  if (typeof data === 'number' || typeof data === 'boolean') return encoder.encode(data.toString())

  throw new Error(`unsuported type ${typeof data || data}`)
}

export const encode = (proto: object, input: object, compress?: boolean): Uint8Array => {
  const tokens = getTokens(proto)
  const set: Uint8Array[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const data = input[token.key]

    if (!token.optional && data === undefined) throw new Error(`missing required property: ${token.key}`)
    if (
      (token.type === 'array' && token.minimumLength > data?.length) ||
      (token.type === 'object' && token.minimumLength > Object.keys(data).length)
    )
      throw new Error(`minimumLength for ${token.key} is set to ${token.minimumLength} but got ${data.length}`)
    set.push(toType(data !== undefined ? data : token.defaultValue))
  }
  return compress ? pako.deflate(typedArraySmartConcat(set)) : typedArraySmartConcat(set)
}
