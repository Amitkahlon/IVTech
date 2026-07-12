import { Router } from 'express';
import mongoose from 'mongoose';
import { Answer, Question, Vote } from '../models';
import { requireAuth } from '../middleware/auth';

export const answersRouter = Router();

answersRouter.post('/answer', requireAuth, async (req, res) => {
  const { questionId, body } = req.body ?? {};

  if (typeof questionId !== 'string' || !mongoose.Types.ObjectId.isValid(questionId)) {
    res.status(400).json({ error: 'A valid questionId is required' });
    return;
  }

  if (typeof body !== 'string' || !body.trim()) {
    res.status(400).json({ error: 'body is required' });
    return;
  }

  const question = await Question.findById(questionId);
  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  const answer = await Answer.create({
    body,
    questionId,
    authorId: req.user!.sub,
  });

  res.status(201).json({ answer });
});

answersRouter.post('/vote', requireAuth, async (req, res) => {
  const { answerId, value } = req.body ?? {};

  if (typeof answerId !== 'string' || !mongoose.Types.ObjectId.isValid(answerId)) {
    res.status(400).json({ error: 'A valid answerId is required' });
    return;
  }

  if (value !== 1 && value !== -1) {
    res.status(400).json({ error: 'value must be 1 or -1' });
    return;
  }

  const answer = await Answer.findById(answerId);
  if (!answer) {
    res.status(404).json({ error: 'Answer not found' });
    return;
  }

  const userId = req.user!.sub;
  const existingVote = await Vote.findOne({ answerId, userId });

  if (existingVote && existingVote.value === value) {
    await existingVote.deleteOne();
    res.json({ voted: false });
    return;
  }

  await Vote.findOneAndUpdate(
    { answerId, userId },
    { answerId, userId, value },
    { upsert: true, returnDocument: 'after' },
  );

  res.json({ voted: true, value });
});
