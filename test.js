import { test } from 'node:test'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { encode, decode } from './exports/index.js'

const proto = {
  'hash?': '',
  input: { test: 1 },
  list: new Object(),
  num: BigInt('1'),
  otherList: new Uint8Array(8)
}

const input = {
  input: { test: 1 },
  list: [{ a: 1 }],
  num: BigInt('1'),
  otherList: new Uint8Array(800)
}

test('encode produces correct byte length', () => {
  const encoded = encode(proto, input)
  assert.strictEqual(encoded.length, 826)
})

test('decode restores all required fields', () => {
  const encoded = encode(proto, input)
  const decoded = decode(proto, encoded)
  assert.strictEqual(Object.keys(decoded).length, 4)
})

test('encode → decode → encode produces identical bytes', () => {
  const encoded = encode(proto, input)
  const decoded = decode(proto, encoded)
  const reencoded = encode(proto, decoded)
  assert.deepStrictEqual(reencoded, encoded)
})

test('optional field is omitted when empty', () => {
  const encoded = encode(proto, input)
  const decoded = decode(proto, encoded)
  assert.strictEqual(decoded.hash, undefined)
})

test('optional field is preserved when provided', () => {
  const encoded = encode(proto, { ...input, hash: '0xabc' })
  const decoded = decode(proto, encoded)
  assert.strictEqual(decoded.hash, '0xabc')
})

test('compress and decompress round-trips correctly', () => {
  const compressed = encode(proto, input, true)
  const decoded = decode(proto, compressed, true)
  assert.strictEqual(Object.keys(decoded).length, 4)
  assert.deepStrictEqual(decoded.input, input.input)
  assert.strictEqual(decoded.num, input.num)
})

test('compressed output is smaller than JSON', (t) => {
  const compressed = encode(proto, input, true)
  const json = new TextEncoder().encode(
    JSON.stringify({ input: input.input, list: input.list, otherList: input.otherList })
  )
  const pct = (((json.length - compressed.length) / json.length) * 100).toFixed(1)
  t.diagnostic(`compressed: ${compressed.length}B, json: ${json.length}B — ${pct}% smaller`)
  assert.ok(compressed.length < json.length, `compressed (${compressed.length}) should be < json (${json.length})`)
})

test('proto encoded output is smaller than JSON', (t) => {
  const encoded = encode(proto, input)
  const json = new TextEncoder().encode(
    JSON.stringify({ input: input.input, list: input.list, otherList: input.otherList })
  )
  const pct = (((json.length - encoded.length) / json.length) * 100).toFixed(1)
  t.diagnostic(`encoded: ${encoded.length}B, json: ${json.length}B — ${pct}% smaller`)
  assert.ok(encoded.length < json.length, `encoded (${encoded.length}) should be < json (${json.length})`)
})

test('missing required field throws', () => {
  assert.throws(
    () => encode(proto, { list: [], num: BigInt(1), otherList: new Uint8Array(8) }),
    /missing required property/
  )
})

// type fidelity tests
const typeProto = {
  str: '',
  num: 0,
  bool: false,
  big: BigInt(0),
  obj: new Object(),
  arr: new Array(),
  bytes: new Uint8Array(0)
}

const typeInput = {
  str: 'hello',
  num: 42,
  bool: true,
  big: BigInt(999),
  obj: { x: 1 },
  arr: [1, 2, 3],
  bytes: new Uint8Array([10, 20, 30])
}

test('decoded string field has type string', () => {
  const decoded = decode(typeProto, encode(typeProto, typeInput))
  assert.strictEqual(typeof decoded.str, 'string')
  assert.strictEqual(decoded.str, 'hello')
})

test('decoded number field has type number', () => {
  const decoded = decode(typeProto, encode(typeProto, typeInput))
  assert.strictEqual(typeof decoded.num, 'number')
  assert.strictEqual(decoded.num, 42)
})

test('decoded boolean field has type boolean', () => {
  const decoded = decode(typeProto, encode(typeProto, typeInput))
  assert.strictEqual(typeof decoded.bool, 'boolean')
  assert.strictEqual(decoded.bool, true)
})

test('decoded boolean false round-trips correctly', () => {
  const decoded = decode(typeProto, encode(typeProto, { ...typeInput, bool: false }))
  assert.strictEqual(typeof decoded.bool, 'boolean')
  assert.strictEqual(decoded.bool, false)
})

test('decoded bigint field has type bigint', () => {
  const decoded = decode(typeProto, encode(typeProto, typeInput))
  assert.strictEqual(typeof decoded.big, 'bigint')
  assert.strictEqual(decoded.big, BigInt(999))
})

test('decoded object field has type object', () => {
  const decoded = decode(typeProto, encode(typeProto, typeInput))
  assert.strictEqual(typeof decoded.obj, 'object')
  assert.ok(!Array.isArray(decoded.obj))
  assert.deepStrictEqual(decoded.obj, { x: 1 })
})

test('decoded array field is an Array', () => {
  const decoded = decode(typeProto, encode(typeProto, typeInput))
  assert.ok(Array.isArray(decoded.arr))
  assert.deepStrictEqual(decoded.arr, [1, 2, 3])
})

test('decoded Uint8Array field is a Uint8Array', () => {
  const decoded = decode(typeProto, encode(typeProto, typeInput))
  assert.ok(decoded.bytes instanceof Uint8Array)
  assert.deepStrictEqual(decoded.bytes, new Uint8Array([10, 20, 30]))
})

test('decoded number zero round-trips correctly', () => {
  const decoded = decode(typeProto, encode(typeProto, { ...typeInput, num: 0 }))
  assert.strictEqual(typeof decoded.num, 'number')
  assert.strictEqual(decoded.num, 0)
})

test('encode performance (uncompressed) < 5ms', () => {
  const start = performance.now()
  encode(proto, input)
  const elapsed = performance.now() - start
  assert.ok(elapsed < 5, `encode took ${elapsed.toFixed(3)}ms`)
})

test('encode performance (compressed) < 20ms', () => {
  const start = performance.now()
  encode(proto, input, true)
  const elapsed = performance.now() - start
  assert.ok(elapsed < 20, `compressed encode took ${elapsed.toFixed(3)}ms`)
})

// big data tests
const bigProto = {
  id: 0,
  label: '',
  tags: new Object(),
  payload: new Uint8Array(0),
  score: BigInt(0)
}

const BIG_COUNT = 10_000
const bigItems = Array.from({ length: BIG_COUNT }, (_, i) => ({
  id: i,
  label: `item-${i}`,
  tags: { index: i, active: true },
  payload: new Uint8Array(64).fill(i % 256),
  score: BigInt(i * 1000)
}))

test('big data: encode/decode round-trip for 10k items', () => {
  for (const item of bigItems) {
    const encoded = encode(bigProto, item)
    const decoded = decode(bigProto, encoded)
    assert.strictEqual(decoded.id, item.id)
    assert.strictEqual(decoded.label, item.label)
    assert.strictEqual(decoded.score, item.score)
    assert.deepStrictEqual(decoded.tags, item.tags)
    assert.deepStrictEqual(decoded.payload, item.payload)
  }
})

test('big data: encode 10k items < 2000ms', () => {
  const start = performance.now()
  for (const item of bigItems) encode(bigProto, item)
  const elapsed = performance.now() - start
  assert.ok(elapsed < 2000, `encoding 10k items took ${elapsed.toFixed(1)}ms`)
})

test('big data: large Uint8Array (10MB) round-trips correctly', () => {
  const largeProto = { name: '', data: new Uint8Array(0) }
  const largeInput = { name: 'blob', data: new Uint8Array(10 * 1024 * 1024).fill(0xab) }
  const encoded = encode(largeProto, largeInput)
  const decoded = decode(largeProto, encoded)
  assert.strictEqual(decoded.name, 'blob')
  assert.deepStrictEqual(decoded.data, largeInput.data)
})

test('big data: compressed 10k-item batch is smaller than uncompressed', (t) => {
  const batchProto = { items: new Object() }
  const uncompressed = encode(batchProto, { items: bigItems.slice(0, 100) })
  const compressed = encode(batchProto, { items: bigItems.slice(0, 100) }, true)
  const pct = (((uncompressed.length - compressed.length) / uncompressed.length) * 100).toFixed(1)
  t.diagnostic(`compressed: ${compressed.length}B, uncompressed: ${uncompressed.length}B — ${pct}% smaller`)
  assert.ok(
    compressed.length < uncompressed.length,
    `compressed (${compressed.length}) should be < uncompressed (${uncompressed.length})`
  )
})
