import React from "react";
import { TypeInput, TypeOption, TypeDate } from "./../fields";

const QuestionField = ({ rules, index, field }) => {
  switch (field.type) {
    case "option":
      return <TypeOption keyform={index} rules={rules} {...field} />;
    case "date":
      return <TypeDate keyform={index} rules={rules} {...field} />;
    default:
      return <TypeInput keyform={index} rules={rules} {...field} />;
  }
};

export default QuestionField;
