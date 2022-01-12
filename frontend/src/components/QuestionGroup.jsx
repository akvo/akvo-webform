import React from "react";
import { Card } from "antd";
import FieldGroupHeader from "./FieldGroupHeader";
import Question from "./Question";

const QuestionGroup = ({
  form,
  questionGroup,
  activeGroup,
  current,
  group,
  state,
  dispatch,
}) => {
  return (
    <Card
      title={<FieldGroupHeader state={state} dispatch={dispatch} {...group} />}
      className={`field-group ${activeGroup !== group.index ? "hidden" : ""} ${
        group.index == questionGroup?.length ? "last" : ""
      }`}
    >
      {group?.repeatable && (
        <div className="repeat-title">
          {group?.heading}-{group?.repeat}
        </div>
      )}
      <Question fields={group.question} form={form} current={current} />
    </Card>
  );
};

export default QuestionGroup;
