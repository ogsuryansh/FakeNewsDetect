function NewsForm({ setResult }) {
  const handleSubmit = async () => {
    // abhi dummy result
    setResult("Fake News");
  };

  return (
    <div>
      <textarea className="w-full p-4 border rounded mb-4" />
      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-red-500 text-white rounded"
      >
        Check News
      </button>
    </div>
  );
}

export default NewsForm;
