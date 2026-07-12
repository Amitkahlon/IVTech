import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { User } from './models';
import { hashPassword } from './utils/hash';

dotenv.config();

const usersToSeed = [
  { nickname: 'alice', fullName: 'Alice Johnson', password: 'alice-P@ss1' },
  { nickname: 'bob', fullName: 'Bob Smith', password: 'bob-P@ss2' },
  { nickname: 'carol', fullName: 'Carol Williams', password: 'carol-P@ss3' },
  { nickname: 'dave', fullName: 'Dave Brown', password: 'dave-P@ss4' },
  { nickname: 'erin', fullName: 'Erin Davis', password: 'erin-P@ss5' },
  { nickname: 'frank', fullName: 'Frank Miller', password: 'frank-P@ss6' },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivtech';
  await connectDB(mongoUri);

  for (const { nickname, fullName, password } of usersToSeed) {
    const passwordHash = hashPassword(password);
    await User.findOneAndUpdate(
      { nickname },
      { nickname, fullName, passwordHash },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    console.log(`Seeded user: ${nickname}`);
  }

  console.log('Seeding complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
