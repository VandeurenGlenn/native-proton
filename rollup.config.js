import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: ['./src/index.ts', 'src/utils.ts'],
    output: {
      format: 'es',
      dir: './exports'
    },
    plugins: [typescript()]
  }
]
