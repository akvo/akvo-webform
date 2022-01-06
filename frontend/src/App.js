import "./App.scss";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./layouts/Home";
import ErrorPage from "./layouts/ErrorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path=":surveyInstance/:formId" element={<Home />} />
        <Route
          path=":surveyInstance"
          element={
            <ErrorPage
              status={505}
              title={"Error Loading Form"}
              messages={["Form Id is not Defined"]}
            />
          }
        />
        <Route
          path=""
          element={
            <ErrorPage
              status={505}
              title={"Error Loading Form"}
              messages={[
                "Survey Instance is not defined",
                "Form Id is not defined",
              ]}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
