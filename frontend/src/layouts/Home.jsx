import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

const Home = () => {
  const [data, setData] = useState(null);
  const { surveyInstance, formId } = useParams();

  useEffect(() => {
    api
      .get(`form/${surveyInstance}/${formId}`)
      .then((res) => {
        console.log(res);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
      });
  }, [surveyInstance, formId]);

  return (
    <div>
      {surveyInstance} - {formId}
    </div>
  );
};

export default Home;
