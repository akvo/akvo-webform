import React, { useState, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import { saveFormToDB } from "../lib/db";
import generateForm from "../lib/form";
import reducer, { defaultValue } from "../lib/store";

const Home = () => {
  const [error, setError] = useState(false);
  const { formId } = useParams();
  const [state, dispatch] = useReducer(reducer, defaultValue);
  const { form } = state;

  useEffect(() => {
    api
      .get(`form/${formId}`)
      .then((res) => {
        const formData = generateForm(res.data);
        saveFormToDB({ formId: formId, ...formData });
        dispatch({ type: "INIT FORM", form: formData });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(`${formId}`, status, statusText);
        setError(e.response);
      });
  }, [formId]);

  if (error) {
    return (
      <ErrorPage
        status={error.status}
        title={"Error Loading Form"}
        messages={[`Form Id ${formId} is not found`]}
      />
    );
  }

  if (!form) {
    console.log("Loading");
  }
  console.log(form);

  return <div>{JSON.stringify(form)}</div>;
};

export default Home;
