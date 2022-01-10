import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import db, { initForm } from "../lib/db";
import generateForm from "../lib/form";
import { useLiveQuery } from "dexie-react-hooks";

const Home = () => {
  const [error, setError] = useState(false);
  const { formId } = useParams();
  const form = useLiveQuery(() => db.forms.get(formId));

  useEffect(() => {
    api
      .get(`form/${formId}`)
      .then((res) => {
        const formData = generateForm(res.data);
        initForm({ formId: formId, ...formData });
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

  return <div>{JSON.stringify(form)}</div>;
};

export default Home;
