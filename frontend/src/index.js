import React, { createContext } from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import "antd/dist/antd.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { defaultValue } from "./lib/store";

const Context = createContext(defaultValue);

ReactDOM.render(
  <Context.Provider value={defaultValue}>
    <App />
  </Context.Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
