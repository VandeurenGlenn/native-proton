import { encode, decode } from "./index.js"

const proto = {
  hash: '',
  input: {
    test: 1
  },
  otherList: new Uint8Array(8)
}

const encoded = encode(proto, {
  hash: '0xf1',
  input: {
    test: 1    
  },
  otherList: new Uint8Array(8)
})

console.log('# can encode');
console.log(encoded.length === 25);
const decoded = decode(proto, encoded)

console.log('# can decode');
console.log(Object.keys(decoded).length === 3);

const normalEncoded = new TextEncoder().encode(JSON.stringify({
  hash: '0xf1',
  input: {
    test: 1    
  },
  list: [{a:1}]
}))

console.log(`# size proto encoded`);
console.log(encoded.length);

console.log('# size normal encoded');
console.log(normalEncoded.length + String('otherList').length + new Uint8Array(8).length);

console.log('# proto encoded is smaller');
console.log(normalEncoded.length + String('otherList').length + new Uint8Array(8).length > encoded.length);

