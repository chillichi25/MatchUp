type Result = "win" | "draw" | "loss";

type RecentFormProps = {
  results: Result[];
};

export function RecentForm({
  results,
}: RecentFormProps) {
  return (
    <div className="flex gap-2">
      {results.map((result, index) => (
        <div
          key={index}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
            result === "win"
              ? "bg-green-500"
              : result === "loss"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        >
          {result === "win"
            ? "W"
            : result === "loss"
            ? "L"
            : "D"}
        </div>
      ))}
    </div>
  );
}