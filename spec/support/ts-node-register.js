import { register } from 'ts-node';

register({
  transpileOnly: true,
  compilerOptions: {
    module: 'ES2020',
    moduleResolution: 'node'
  },
  esm: true
});
