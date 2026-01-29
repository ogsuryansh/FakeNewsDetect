import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/NavBar.jsx";
import Home from "./components/Home.jsx";
import Detect from "./components/Detect.jsx";
import Limit from "./components/Limit.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/detect" element={<Detect />} />
        <Route path="/limit" element={<Limit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
