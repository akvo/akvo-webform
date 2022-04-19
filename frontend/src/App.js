import "./App.scss";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, InfoPage, OauthLogin } from "./layouts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path=":formId" element={<Home />} />
        <Route path=":formId/info" element={<InfoPage />} />
        <Route path=":formId/:cacheId" element={<Home />} />
        <Route path="" element={<OauthLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
