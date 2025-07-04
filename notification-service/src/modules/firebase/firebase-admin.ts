import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

const pathToServiceAccount = join(process.cwd(), 'service-account.json');
const serviceAccount = JSON.parse(readFileSync(pathToServiceAccount, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log('[DEBUG] Firebase initialized ✅');

export { admin };
