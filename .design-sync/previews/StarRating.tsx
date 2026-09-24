import { StarRating } from 'football-ds';

export const Sizes = () => (
  <div className="flex flex-col gap-3">
    <StarRating rating={3} size="sm" readonly />
    <StarRating rating={4} size="md" readonly />
    <StarRating rating={5} size="lg" readonly />
  </div>
);

export const Interactive = () => (
  <StarRating rating={2} onRatingChange={() => {}} />
);

export const Empty = () => (
  <StarRating rating={0} onRatingChange={() => {}} />
);
