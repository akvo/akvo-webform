import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";

const Home = () => {
  const [data, setData] = useState("Loading...");
  const [error, setError] = useState(false);
  const { formId } = useParams();

  useEffect(() => {
    api
      .get(`form/${formId}`)
      .then((res) => {
        setData(res.data);
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

  return <div>{JSON.stringify(data)}</div>;
};

export default Home;
