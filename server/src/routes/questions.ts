import { Router } from 'express';
import mongoose from 'mongoose';
import { Answer, Question, User } from '../models';
import { requireAuth } from '../middleware/auth';
import { authorLookupStages } from '../utils/aggregation';

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
    ...authorLookupStages(),
    {
      $project: {
        title: 1,
        body: 1,
        tags: 1,
        authorId: 1,
        username: 1,
        createdAt: 1,
        answerCount: 1,
        voteCount: 1,
      },
    },
  );

  const questions = await Question.aggregate(pipeline);

  res.json({ questions, page, limit });
});

questionsRouter.get('/getQuestion/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid question id' });
    return;
  }

  const question = await Question.findById(id);
  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  const author = await User.findById(question.authorId).select('username');

  const answers = await Answer.aggregate([
    { $match: { questionId: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'votes',
        localField: '_id',
        foreignField: 'answerId',
        as: 'votes',
      },
    },
    {
      $addFields: {
        voteCount: { $sum: '$votes.value' },
      },
    },
    { $sort: { voteCount: -1, createdAt: 1 } },
    ...authorLookupStages(),
    {
      $project: {
        body: 1,
        questionId: 1,
        authorId: 1,
        username: 1,
        createdAt: 1,
        voteCount: 1,
      },
    },
  ]);

  res.json({
    question: { ...question.toObject(), username: author?.username },
    answers,
  });
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
