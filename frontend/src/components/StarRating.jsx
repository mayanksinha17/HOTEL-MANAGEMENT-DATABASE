/**
 * StarRating — displays star icons for hotel ratings.
 */
import { FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating ? (
          <FaStar key={star} size={size} className="text-[#C9A84C]" />
        ) : (
          <FiStar key={star} size={size} className="text-gray-300" />
        )
      ))}
    </div>
  );
}
