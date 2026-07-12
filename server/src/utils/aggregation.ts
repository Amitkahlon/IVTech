import type { PipelineStage } from 'mongoose';

export function authorLookupStages(): PipelineStage[] {
  return [
    {
      $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $addFields: {
        username: { $arrayElemAt: ['$author.username', 0] },
      },
    },
  ];
}
