import React from "react";
import TypeOption from "../fields/TypeOption";
import TypeDate from "../fields/TypeDate";
import TypeNumber from "../fields/TypeNumber";
import TypeInput from "../fields/TypeInput";
import TypeText from "../fields/TypeText";

const QuestionField = ({ rules, index, field }) => {
  switch (field.type) {
    case "option":
      return <TypeOption keyform={index} rules={rules} {...field} />;
    case "date":
      return <TypeDate keyform={index} rules={rules} {...field} />;
    case "number":
      return <TypeNumber keyform={index} rules={rules} {...field} />;
    case "text":
      return <TypeText keyform={index} rules={rules} {...field} />;
    default:
      return <TypeInput keyform={index} rules={rules} {...field} />;
  }
};

export default QuestionField;
