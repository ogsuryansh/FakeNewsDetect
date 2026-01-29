import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      <img
        src="/bg-news.jpg"
        alt="news background"
        className="absolute inset-0 w-full h-full object-cover "
      />
      <div className="absolute inset-0 bg-white/40"></div>
      <div className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 mt-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Stop Fake News.
              <span className="text-red-500"> Verify Before You Trust.</span>
            </h1>

            <p className="text-sm text-gray-600 mb-8 pl-2 pr-4">
              NoCap is an AI-powered fake news detection platform that helps users verify the authenticity of news content. By analyzing textual patterns using machine learning techniques, NoCap determines whether a piece of news is real or misleading. The platform aims to combat misinformation, promote digital awareness, and encourage responsible sharing of information by providing quick, reliable, and easy-to-understand results.
            </p>

            <Link to="/detect">
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg mt-[220px] hover:bg-red-600 transition">
                Start Detecting
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
