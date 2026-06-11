const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();
const DOC_ID = 'data/db';

async function migrate() {
  const dbPath = path.join(__dirname, 'data', 'db.json');
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    await db.doc(DOC_ID).set(data);
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
