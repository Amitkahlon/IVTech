import { Router } from 'express';
import mongoose from 'mongoose';
import { Answer, Question, User } from '../models';
import { requireAuth } from '../middleware/auth';
import { authorLookupStages } from '../utils/aggregation';
import {
  QUESTION_TITLE_MIN,
  QUESTION_TITLE_MAX,
  QUESTION_BODY_MIN,
  QUESTION_BODY_MAX,
  TAG_MAX_LENGTH,
  TAGS_MAX_COUNT,
  SEARCH_MAX_LENGTH,
} from '../utils/validation';

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

questionsRouter.get('/getQuestions', requireAuth, async (req, res) => {
  const { search, page: pageParam, limit: limitParam } = req.query;

  const page = parsePositiveInt(pageParam, 1);
  const limit = Math.min(parsePositiveInt(limitParam, DEFAULT_LIMIT), MAX_LIMIT);

  if (search !== undefined && typeof search !== 'string') {
    res.status(400).json({ error: 'search must be a single string value' });
    return;
  }

  if (typeof search === 'string' && search.length > SEARCH_MAX_LENGTH) {
    res.status(400).json({ error: `search must be at most ${SEARCH_MAX_LENGTH} characters` });
    return;
  }

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

questionsRouter.get('/getQuestionAnswer/:questionId', requireAuth, async (req, res) => {
  const questionId = String(req.params.questionId);

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    res.status(400).json({ error: 'Invalid question id' });
    return;
  }

  const question = await Question.findById(questionId);
  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  const author = await User.findById(question.authorId).select('username');
  const currentUserId = new mongoose.Types.ObjectId(req.user!.sub);

  const answers = await Answer.aggregate([
    { $match: { questionId: new mongoose.Types.ObjectId(questionId) } },
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
        myVote: {
          $let: {
            vars: {
              mine: {
                $filter: {
                  input: '$votes',
                  as: 'vote',
                  cond: { $eq: ['$$vote.userId', currentUserId] },
                },
              },
            },
            in: { $arrayElemAt: ['$$mine.value', 0] },
          },
        },
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
        myVote: 1,
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

  if (typeof title !== 'string' || typeof body !== 'string') {
    res.status(400).json({ error: 'title and body are required' });
    return;
  }

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();

  if (trimmedTitle.length < QUESTION_TITLE_MIN || trimmedTitle.length > QUESTION_TITLE_MAX) {
    res.status(400).json({
      error: `title must be between ${QUESTION_TITLE_MIN} and ${QUESTION_TITLE_MAX} characters`,
    });
    return;
  }

  if (trimmedBody.length < QUESTION_BODY_MIN || trimmedBody.length > QUESTION_BODY_MAX) {
    res.status(400).json({
      error: `body must be between ${QUESTION_BODY_MIN} and ${QUESTION_BODY_MAX} characters`,
    });
    return;
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    res.status(400).json({ error: 'tags must be an array of strings' });
    return;
  }

  const trimmedTags: string[] = (tags ?? []).map((tag: unknown) => (typeof tag === 'string' ? tag.trim() : ''));

  if (
    trimmedTags.length > TAGS_MAX_COUNT ||
    trimmedTags.some((tag) => tag.length === 0 || tag.length > TAG_MAX_LENGTH)
  ) {
    res.status(400).json({
      error: `up to ${TAGS_MAX_COUNT} tags allowed, each 1-${TAG_MAX_LENGTH} characters`,
    });
    return;
  }

  const question = await Question.create({
    title: trimmedTitle,
    body: trimmedBody,
    tags: trimmedTags,
    authorId: req.user!.sub,
  });

  res.status(201).json({ question });
});
