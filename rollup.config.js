import typescript from "@rollup/plugin-typescript"
import tsConfig from './tsconfig.json' assert { type: 'json'}


export default [{
  input: ['./src/index.ts'],
  output: {
    format: 'es',
    dir: './'
  },
  plugins: [
    typescript(tsConfig)
  ]
}]