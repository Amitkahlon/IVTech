import { Router } from 'express';
import mongoose from 'mongoose';
import { Question } from '../models';
import { requireAuth } from '../middleware/auth';

export const questionsRouter = Router();

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

questionsRouter.get('/getQuestions', async (req, res) => {
  const { search, page: pageParam, limit: limitParam } = req.query;

  const page = parsePositiveInt(pageParam, 1);
  const limit = Math.min(parsePositiveInt(limitParam, DEFAULT_LIMIT), MAX_LIMIT);

  const pipeline: mongoose.PipelineStage[] = [];

  if (typeof search === 'string' && search.trim()) {
    const regex = new RegExp(escapeRegExp(search.trim()), 'i');
    pipeline.push({
      $match: {
        $or: [{ title: regex }, { body: regex }, { tags: regex }],
      },
    });
  }

  pipeline.push(
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
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
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
  );

  const questions = await Question.aggregate(pipeline);

  res.json({ questions, page, limit });
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
