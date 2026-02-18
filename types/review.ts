export type ReviewFromApi = {
  _id: string;
  rating: number;
  comment?: string;
  user?: { name?: string; email?: string };
  createdAt: string;
  helpfulYes?: number;
  helpfulNo?: number;
};

export type FeaturedReviewFromApi = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
  product: { _id: string; name: string } | null;
};
