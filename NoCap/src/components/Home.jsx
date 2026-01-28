import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="relative min-h-screen bg-white">

      {/* BACKGROUND IMAGE */}
      <img
        src="/bg-news.jpg"
        alt="news background"
        className="absolute inset-0 w-full h-full object-cover "
      />

      {/* WHITE OVERLAY (for readability) */}
      <div className="absolute inset-0 bg-white/40"></div>

      {/* ACTUAL CONTENT */}
      <div className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">

          {/* LEFT CONTENT (PEHLA WALA) */}
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


// import NewsForm from "./NewsForm";

// function Home() {
//   return (
//     <div className="min-h-screen px-6 py-16">

//       {/* HERO SECTION */}
//       <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">

//         {/* LEFT CONTENT */}
//         <div className="md:w-1/2">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-500">
//             NoCap – Fake News Detection
//           </h1>

//           <p className="text-lg md:text-xl mb-6">
//             Verify news instantly. Stop misinformation before it spreads.
//           </p>

//           <p className="text-gray-700 mb-8">
//             NoCap is an AI-powered platform that analyzes news content using
//             machine learning to identify fake and misleading information,
//             helping users make informed decisions in the digital world.
//           </p>

//           {/* NEWS INPUT */}
//           <NewsForm />
//         </div>

//         {/* RIGHT IMAGE PLACEHOLDER */}
//         <div className="md:w-1/2 flex justify-center">
//           <div className="w-full max-w-md h-64 md:h-80 bg-white 
//                           border-2 border-dashed border-red-400 
//                           rounded-xl flex items-center justify-center text-center">
//             <span className="text-gray-500">
//               Image / Illustration here
//             </span>
//           </div>
//         </div>

//       </div>

//       {/* WHY NOCAP */}
//       <div className="mt-20 text-center">
//         <h2 className="text-3xl font-semibold mb-10">Why NoCap?</h2>

//         <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
//           <div className="p-6 bg-red-100 rounded shadow">
//             🚀 Fast & Easy
//           </div>
//           <div className="p-6 bg-red-100 rounded shadow">
//             🤖 AI Powered
//           </div>
//           <div className="p-6 bg-red-100 rounded shadow">
//             🛡️ Fake News Detection
//           </div>
//           <div className="p-6 bg-red-100 rounded shadow">
//             🌍 Digital Awareness
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }


// export default Home;
