import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { User } from './models';
import { hashPassword } from './utils/hash';

dotenv.config();

const usersToSeed = [
  { username: 'alice', nickname: 'alice', fullName: 'Alice Johnson', password: 'alice-P@ss1' },
  { username: 'bob', nickname: 'bob', fullName: 'Bob Smith', password: 'bob-P@ss2' },
  { username: 'carol', nickname: 'carol', fullName: 'Carol Williams', password: 'carol-P@ss3' },
  { username: 'dave', nickname: 'dave', fullName: 'Dave Brown', password: 'dave-P@ss4' },
  { username: 'erin', nickname: 'erin', fullName: 'Erin Davis', password: 'erin-P@ss5' },
  { username: 'frank', nickname: 'frank', fullName: 'Frank Miller', password: 'frank-P@ss6' },
  { username: 'amit', nickname: 'amit', fullName: 'Amit Kahlon', password: '123' },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ivtech';
  await connectDB(mongoUri);

  for (const { username, nickname, fullName, password } of usersToSeed) {
    const passwordHash = hashPassword(password);
    await User.findOneAndUpdate(
      { nickname },
      { username, nickname, fullName, passwordHash },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    console.log(`Seeded user: ${username}`);
  }

  console.log('Seeding complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
