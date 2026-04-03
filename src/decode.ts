import typedArraySmartDeconcat from '@vandeurenglenn/typed-array-smart-deconcat'
import typedArrayUtils from '@vandeurenglenn/typed-array-utils'
import pako from 'pako'
import { jsonParseBigInt } from './utils.js'
import { getTokens } from './tokenizer.js'

const { toString } = typedArrayUtils
const decoder = new TextDecoder()

export const decode = (proto: object, uint8Array: Uint8Array, compressed?: boolean): object => {
  if (compressed) uint8Array = pako.inflate(uint8Array)
  let deconcated = typedArraySmartDeconcat(uint8Array)
  const output = {}

  const tokens = getTokens(proto)

  if (tokens.length !== deconcated.length)
    console.warn(`length mismatch: expected  ${tokens.length} got ${uint8Array.length}`)

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'uint8Array') output[token.key] = deconcated[i]
    else if (token.type === 'string') output[token.key] = toString(deconcated[i])
    else if (token.type === 'boolean') output[token.key] = decoder.decode(deconcated[i]) === 'true'
    else if (token.type === 'number') output[token.key] = Number(decoder.decode(deconcated[i]))
    else if (token.type === 'bigint') output[token.key] = BigInt(decoder.decode(deconcated[i]))
    else if (token.type === 'object' || token.type === 'array')
      output[token.key] = JSON.parse(decoder.decode(deconcated[i]), jsonParseBigInt)
    if (token.optional) {
      if (!output[token.key] || output[token.key].length === 0) delete output[token.key]
    }
    if (!token.optional && output[token.key] === undefined) throw new Error(`missing required property: ${token.key}`)
  }
  return output
}
