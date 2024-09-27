import { encode, decode } from './exports/index.js'
const proto = {
  'hash?': '',
  input: {
    test: 1
  },
  list: new Object(),
  num: BigInt('1'),
  otherList: new Uint8Array(8)
}
console.time('uncompressed')
const encoded = encode(proto, {
  input: {
    test: 1
  },
  list: [{ a: 1 }],
  num: BigInt('1'),
  otherList: new Uint8Array(800)
})
console.timeEnd('uncompressed')
console.time('compressed')

const compressedEncoded = encode(
  proto,
  {
    input: {
      test: 1
    },
    list: [{ a: 1 }],
    num: BigInt('1'),
    otherList: new Uint8Array(800)
  },
  true
)
console.timeEnd('compressed')
const compressedDecoded = decode(proto, compressedEncoded, true)

console.log('# can encode')
console.log(encoded.length === 826)

const decoded = decode(proto, encoded)

const secondEncoded = encode(proto, decoded)
for (let i = 0; i < encoded.length; i++) {
  if (secondEncoded[i] !== encoded[i]) console.log('encoded mismatch')
}

console.log('# can decode')
console.log(Object.keys(decoded).length === 4)
console.time('normal encode')
const normalEncoded = new TextEncoder().encode(
  JSON.stringify({
    hash: '',
    input: {
      test: 1
    },
    list: [{ a: 1 }],
    otherList: new Uint8Array(800)
  })
)

console.timeEnd('normal encode')

console.log(`# size proto encoded`)
console.log(encoded.length + '\n')

console.log(`# size proto compressed encoded`)
console.log(compressedEncoded.length + '\n')

console.log('# size normal encoded')
console.log(normalEncoded.length + '\n')

console.log('# proto encoded is smaller')
console.log(normalEncoded.length > encoded.length + '\n')

console.log('# proto compressed encoded is smaller')
console.log(normalEncoded.length > compressedEncoded.length + '\n')
