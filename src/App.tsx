import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PanoramaListPage from "./pages/PanoramaListPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>AirGo</div>} />
        <Route path="/panoramas" element={<PanoramaListPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
