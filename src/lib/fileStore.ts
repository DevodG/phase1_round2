import { db } from './firebaseAdmin';

const DOC_ID = 'data/db';

export async function readData(): Promise<any> {
  try {
    const doc = await db.doc(DOC_ID).get();
    if (doc.exists) {
      return doc.data();
    } else {
      return { puzzles: [], settings: { googleFormUrl: '', teamIdFieldId: '', answerFieldId: '' }, teams: [] };
    }
  } catch (error) {
    console.error("Error reading from Firestore:", error);
    return { puzzles: [], settings: { googleFormUrl: '', teamIdFieldId: '', answerFieldId: '' }, teams: [] };
  }
}

export async function writeData(data: Record<string, unknown>) {
  try {
    await db.doc(DOC_ID).set(data);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
  }
}
