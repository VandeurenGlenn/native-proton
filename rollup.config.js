import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: ['./src/index.ts', './src/encode.ts', './src/decode.ts', './src/utils.ts', './src/tokenizer.ts'],
    output: {
      format: 'es',
      dir: './exports'
    },
    plugins: [typescript()]
  }
]
