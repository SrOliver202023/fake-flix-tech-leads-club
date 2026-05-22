import * as dotenv from 'dotenv';
import { resolve } from 'path';

// resolve() garante o caminho absoluto correto a partir da raiz onde o comando é executado
dotenv.config({ path: resolve(__dirname, '../.env.test') });
