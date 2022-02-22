import "./App.scss";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, ErrorPage } from "./layouts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path=":formId" element={<Home />} />
        <Route path=":formId/:cacheId" element={<Home />} />
        <Route
          path=""
          element={
            <ErrorPage
              status={505}
              title={"Error Loading Form"}
              messages={["Form Id is not defined"]}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
