import { register } from 'ts-node';

register({
  project: './backend/tests/tsconfig.json',
  transpileOnly: true
}); 