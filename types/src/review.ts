import { z } from 'zod';

export const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP'] as const;
export const gradesEnum = z.enum(grades);
export type ReviewGrade = z.infer<typeof gradesEnum>;

export const tags = [
  'Clear grading criteria',
  'Tough grader',
  'Amazing lectures',
  'Test heavy',
  'Get ready to read',
  'Extra credit',
  'Participation matters',
  'Graded by few things',
  "Skip class? You won't pass",
  'Accessible outside class',
  'Beware of pop quizzes',
  'Lots of homework',
  'So many papers',
  'Lecture heavy',
  'Group projects',
  'Gives good feedback',
] as const;
export const tagsEnum = z.enum(tags);
export type ReviewTags = z.infer<typeof tagsEnum>;

export const reviewSubmission = z.object({
  professorID: z.string(),
  courseID: z.string(),
  userDisplay: z.string(),
  reviewContent: z.string().max(500),
  rating: z.number().min(1).max(5),
  difficulty: z.number().min(1).max(5),
  gradeReceived: gradesEnum,
  forCredit: z.boolean(),
  quarter: z.string(),
  takeAgain: z.boolean(),
  textbook: z.boolean(),
  attendance: z.boolean(),
  tags: z.array(tagsEnum),
  captchaToken: z.string().optional(),
});
export type ReviewSubmission = z.infer<typeof reviewSubmission>;

export const editReviewSubmission = reviewSubmission.extend({ _id: z.string() });
export type EditReviewSubmission = z.infer<typeof editReviewSubmission>;

export const reviewData = reviewSubmission.omit({ captchaToken: true }).extend({
  _id: z.string(),
  userID: z.string(),
  verified: z.boolean(),
  score: z.number(),
  userVote: z.number(),
  timestamp: z.string(),
});
export type ReviewData = z.infer<typeof reviewData>;

export type FeaturedReviewData = Omit<ReviewData, 'score' | 'userVote'>;

export const voteRequest = z.object({
  id: z.string(),
  upvote: z.boolean(),
});
export type VoteRequest = z.infer<typeof voteRequest>;

export const featuredQuery = z.object({
  type: z.enum(['course', 'professor']),
  id: z.string(),
});
export type FeaturedQuery = z.infer<typeof featuredQuery>;
