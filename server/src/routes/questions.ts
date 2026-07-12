import { Router } from 'express';
import { Question } from '../models';

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
