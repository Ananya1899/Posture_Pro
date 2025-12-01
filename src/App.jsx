import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { InfoIntro } from "./components/InfoIntro.jsx";

import PostureMonitor from "./components/PostureMonitor";
import InfoPage from "./components/InfoPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostureMonitor />} />
        <Route path="/infoscreen" element={<InfoIntro />} />
        <Route path="/info" element={<InfoPage />} />
      </Routes>
    </BrowserRouter>
  );
}
