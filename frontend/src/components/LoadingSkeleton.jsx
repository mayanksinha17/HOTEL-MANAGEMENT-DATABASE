/**
 * LoadingSkeleton — placeholder loading states for cards and lists.
 */

export function HotelCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-full" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function HotelListSkeleton() {
  return (
    <div className="card flex flex-col md:flex-row">
      <div className="skeleton h-48 md:h-auto md:w-72 shrink-0" />
      <div className="p-5 flex-1 space-y-3">
        <div className="skeleton h-6 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-28" />
          <div className="skeleton h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-1/4" />
    </div>
  );
}
