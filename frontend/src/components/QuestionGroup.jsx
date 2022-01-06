import React from "react";
import QuestionFiled from "./QuestionField";

const QuestionGroup = ({ questions }) => {
  return questions.map((question) => <QuestionFiled {...question} />);
};

export default QuestionGroup;
