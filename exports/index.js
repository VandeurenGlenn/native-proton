import { encode } from './encode.js';
import { decode } from './decode.js';
import '@vandeurenglenn/typed-array-smart-concat';
import 'pako';
import './utils.js';
import './tokenizer.js';
import '@vandeurenglenn/typed-array-smart-deconcat';
import '@vandeurenglenn/typed-array-utils';

var index = { encode, decode };

export { decode, index as default, encode };
