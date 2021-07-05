import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./Home";
import Error from "./Error";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { questionReducers } from "./reducers/questionReducers.js";
import { CACHE_URL } from "./util/Environment.js";

const store = createStore(questionReducers);

class App extends Component {
  render() {
    let path = "/:instance/:surveyid";
    if (CACHE_URL) {
      path = path + "/:cacheid";
    }
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Switch>
            <Route exact path={"/"} render={(props) => <Error />} />
            <Route exact path={"/:instance"} render={(props) => <Error />} />
            <Route
              exact
              path={path}
              render={(props) => <Home key="home" {...props} />}
            />
          </Switch>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
