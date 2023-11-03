import typedArraySmartConcat from "@vandeurenglenn/typed-array-smart-concat"
import typedArraySmartDeconcat from '@vandeurenglenn/typed-array-smart-deconcat'
import typedArrayUtils from "@vandeurenglenn/typed-array-utils"
import { BigNumber } from "@leofcoin/utils"
import pako from 'pako'

const { fromString, toString } =  typedArrayUtils

const isJson = (type: string) => type === 'object' || 'array'

const isString = (type: string) => type === 'string'

const isNumber = (type: string) => type === 'number'

const isBoolean = (type: string) => type === 'boolean'

const isUint8Array = (type: string) => type === 'uint8Array'

const isBigNumber = (type: string) => type === 'bigNumber'

const tokenize = (key: string, value: string | number | BigNumber | object | []) => {  
  const optional = key.endsWith('?')
  let type = value === undefined ? key : value

  if (type instanceof Uint8Array) type = 'uint8Array' 
  else if (type instanceof BigNumber) type = 'bigNumber'
  else type = Array.isArray(type) ? 'array' : typeof type
  
  const parts = key.split('?')
  const minimumLength = parts[2]?.includes('min') ? parts[2].split['min:'][1] : 0
  return { type, optional, key: parts[0], minimumLength }
}

const toType = (data: BigNumber | number | string | Uint8Array | ArrayBuffer | object | []): Uint8Array => {
  // always return uint8Arrays as they are
  if (data instanceof Uint8Array) return data
  // returns the ArrayBuffer as a UintArray
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  // returns the bigNumbers hex as a UintArray
  if (data instanceof BigNumber) return new TextEncoder().encode(data._hex || data.toHexString())
  // returns the string as a UintArray
  if (typeof data === 'string') return new TextEncoder().encode(data)
  // returns the object as a UintArray
  if (typeof data === 'object') return new TextEncoder().encode(JSON.stringify(data))
  // returns the number as a UintArray
  if (typeof data === 'number' || typeof data === 'boolean') return new TextEncoder().encode(data.toString())

  throw new Error(`unsuported type ${typeof data || data}`)
}

export const encode = (proto: object, input: object, compress?: boolean): Uint8Array => {
  const keys = Object.keys(proto)
  const values: any[] = Object.values(proto)

  const set: Uint8Array[] = []
  
  for (let i = 0; i < values.length; i++) {         
    const token = tokenize(keys[i], values[i])
    const data = input[token.key]
    
    if (!token.optional && data === undefined) throw new Error(`missing required property: ${token.key}`)
    if (token.type === 'array' && token.minimumLength > data.length || token.type === 'object' && token.minimumLength > Object.keys(data).length) throw new Error(`minimumLength for ${token.key} is set to ${token.minimumLength} but got ${data.length}`)
    // always push data to the set.
    // when data is undefined push the default value of the proto
    set.push(toType(data || values[i]))
  }  
  return compress ? pako.deflate(typedArraySmartConcat(set))  : typedArraySmartConcat(set)
}

export const decode = (proto: object, uint8Array: Uint8Array, compressed?: boolean): object => {
  if (compressed) uint8Array = pako.inflate(uint8Array)
  let deconcated = typedArraySmartDeconcat(uint8Array)
  const output = {}

  const keys = Object.keys(proto)
  const values: any[] = Object.values(proto)

  if (keys.length !== deconcated.length) console.warn(`length mismatch: expected  ${keys.length} got ${uint8Array.length}`);
  
  for (let i = 0; i < values.length; i++) {
    const token = tokenize(keys[i], values[i])
    
    if (isUint8Array(token.type)) output[token.key] = deconcated[i]
    else if (isString(token.type)) output[token.key] = toString(deconcated[i])
    else if (isBoolean(token.type)) output[token.key] = Boolean(new TextDecoder().decode(deconcated[i]))
    else if (isNumber(token.type)) output[token.key] = Number(new TextDecoder().decode(deconcated[i]))
    else if (isBigNumber(token.type)) output[token.key] = BigNumber.from(new TextDecoder().decode(deconcated[i]))
    else if (isJson(token.type)) output[token.key] = JSON.parse(new TextDecoder().decode(deconcated[i]))
    if (token.optional) {
      if (!output[token.key] || output[token.key].length === 0) delete output[token.key]
    } 
    if (!token.optional && output[token.key] === undefined) throw new Error(`missing required property: ${token.key}`)
  }
  return output
}

export default {
  encode,
  decode
}