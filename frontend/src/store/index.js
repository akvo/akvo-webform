import { useReducer, useContext, createContext } from "react";
import reducer from "./reducer";
import initialValue from "./data";

const StateContext = createContext();
const DispatchContext = createContext();

export const ActionProvider = ({ children, ...props }) => {
  const [state, dispatch] = useReducer(reducer, { ...initialValue, ...props });
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};

const dataProviders = {
  Values: () => useContext(StateContext),
  Actions: () => useContext(DispatchContext),
};

export default dataProviders;
