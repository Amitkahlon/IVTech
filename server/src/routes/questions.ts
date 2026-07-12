import { Router } from 'express';
import { Question } from '../models';
import { requireAuth } from '../middleware/auth';

export const questionsRouter = Router();

questionsRouter.get('/getQuestions', async (_req, res) => {
  const questions = await Question.aggregate([
    {
      $lookup: {
        from: 'answers',
        localField: '_id',
        foreignField: 'questionId',
        as: 'answers',
      },
    },
    {
      $addFields: {
        answerCount: { $size: '$answers' },
        answerIds: '$answers._id',
      },
    },
    {
      $lookup: {
        from: 'votes',
        localField: 'answerIds',
        foreignField: 'answerId',
        as: 'votes',
      },
    },
    {
      $addFields: {
        voteCount: { $sum: '$votes.value' },
      },
    },
    {
      $project: {
        title: 1,
        body: 1,
        tags: 1,
        authorId: 1,
        createdAt: 1,
        answerCount: 1,
        voteCount: 1,
      },
    },
  ]);

  res.json({ questions });
});

questionsRouter.post('/createQuestion', requireAuth, async (req, res) => {
  const { title, body, tags } = req.body ?? {};

  if (typeof title !== 'string' || !title.trim() || typeof body !== 'string' || !body.trim()) {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  if (tags !== undefined && (!Array.isArray(tags) || !tags.every((tag) => typeof tag === 'string'))) {
    res.status(400).json({ error: 'tags must be an array of strings' });
    return;
  }

  const question = await Question.create({
    title,
    body,
    tags: tags ?? [],
    authorId: req.user!.sub,
  });

  res.status(201).json({ question });
});
