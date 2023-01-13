# native-proton
> Makes things smaller

## install
```sh
npm i @vandeurenglenn/proto-array
```

## usage
 
```js
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

## explanation

when encoding keys(propertyNames) are excluded from the encoded data using the provided proto<br>
when decoding these keys are set using the provided proto