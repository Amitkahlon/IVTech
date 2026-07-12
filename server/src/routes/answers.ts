import { Router } from 'express';
import mongoose from 'mongoose';
import { Answer, Question } from '../models';
import { requireAuth } from '../middleware/auth';

export const answersRouter = Router();

answersRouter.post('/createAnswer', requireAuth, async (req, res) => {
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
