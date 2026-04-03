# native-proton
> Makes things smaller

## install
```sh
npm i @vandeurenglenn/proto-array
```

## usage

```js
import { encode, decode } from '@vandeurenglenn/proto-array'

const proto = {
  index: 0,
  hash: '0xf1a1'
}

const data = {
  index: 5,
  hash: '0xa1f1'
}

const encoded = encode(proto, data)
const decoded = decode(proto, encoded)
```

## proto key syntax

Keys in the proto object control field behavior using a `?`-separated syntax:

| Syntax | Description |
|---|---|
| `key` | Required field |
| `key?` | Optional field — omitted from output if empty/undefined |
| `key??min:N` | Optional field with minimum length of `N` |

## supported types

The proto value determines the field type. Use any of the following:

| Value | Encoded type |
|---|---|
| `''` or any string | `string` |
| `0` or any number | `number` |
| `true` / `false` | `boolean` |
| `BigInt(0)` | `bigint` |
| `{}` or `new Object()` | `object` (JSON) |
| `[]` or `new Array()` | `array` (JSON) |
| `new Uint8Array()` | `uint8Array` (raw bytes) |

## compression

Pass `true` as the third argument to `encode`/`decode` to enable pako deflate compression:

```js
const compressed = encode(proto, data, true)
const decoded = decode(proto, compressed, true)
```

## example

```js
import { encode, decode } from '@vandeurenglenn/proto-array'

const proto = {
  'hash?': '',          // optional string
  input: { test: 1 },  // required object
  count: 0,            // required number
  id: BigInt(1),       // required bigint
  bytes: new Uint8Array() // required raw bytes
}

const encoded = encode(proto, {
  input: { test: 1 },
  count: 42,
  id: BigInt(9),
  bytes: new Uint8Array(8)
})

const decoded = decode(proto, encoded)
```

## explanation

When encoding, property names are excluded from the output — only values are stored in order using the provided proto as a schema. When decoding, property names are restored from the proto. This produces significantly smaller output than JSON, especially for repeated messages with the same shape.