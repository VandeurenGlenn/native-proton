import { encode, decode } from "./index.js"

const proto = {
  'hash?': '',
  input: {
    test: 1
  },
  otherList: new Uint8Array(8)
}

const encoded = encode(proto, {
  input: {
    test: 1    
  },
  otherList: new Uint8Array(8)
})

console.log('# can encode');
console.log(encoded.length === 21);
const decoded = decode(proto, encoded)

console.log('# can decode');
console.log(Object.keys(decoded).length === 2);

const normalEncoded = new TextEncoder().encode(JSON.stringify({
  hash: '',
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

