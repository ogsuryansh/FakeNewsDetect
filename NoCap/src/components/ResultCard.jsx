function ResultCard({ result }) {
  if (!result) return null; // jab result na ho

  const isFake = result.toLowerCase().includes("fake");

  return (
    <div
      className={`mt-8 p-6 rounded-xl text-center shadow-lg
      ${isFake 
        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
      }`}
    >
      <h2 className="text-2xl font-bold mb-2">
        {isFake ? "🚨 Fake News Detected" : "✅ Real News"}
      </h2>

      <p className="text-lg">
        {isFake
          ? "This news appears to be misleading or false."
          : "This news appears to be genuine and trustworthy."}
      </p>
    </div>
  );
}

export default ResultCard;
