import React from "react";
import {
  TypeInput,
  TypeOption,
  TypeDate,
  TypeGeo,
  TypeCascade,
  TypeFile,
} from "./../fields";

const QuestionField = ({ rules, index, field, form }) => {
  switch (field.type) {
    case "geo":
      return <TypeGeo keyform={index} form={form} rules={rules} {...field} />;
    case "cascade":
      return (
        <TypeCascade keyform={index} form={form} rules={rules} {...field} />
      );
    case "option":
      return <TypeOption keyform={index} rules={rules} {...field} />;
    case "date":
      return <TypeDate keyform={index} rules={rules} {...field} />;
    case "photo":
      return <TypeFile keyform={index} rules={rules} {...field} />;
    default:
      return <TypeInput keyform={index} form={form} rules={rules} {...field} />;
  }
};

export default QuestionField;
