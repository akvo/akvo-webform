import React from "react";
import { Card } from "antd";
import Question from "./Question";
import FieldGroupHeader from "./FieldGroupHeader";
import range from "lodash/range";

const QuestionGroup = ({
  form,
  questionGroup,
  activeGroup,
  current,
  group,
  state,
  dispatch,
}) => {
  const repeats = range(group.repeat);
  return (
    <Card
      title={<FieldGroupHeader state={state} dispatch={dispatch} {...group} />}
      className={`field-group ${activeGroup !== group.index ? "hidden" : ""} ${
        group.index === questionGroup?.length ? "last" : ""
      }`}
    >
      {repeats.map((r) => (
        <div key={r}>
          {group?.repeatable && (
            <div className="repeat-title">
              {group?.heading}-{r + 1}
            </div>
          )}
          <Question
            repeat={r}
            fields={group.question}
            form={form}
            current={current}
          />
        </div>
      ))}
    </Card>
  );
};

export default QuestionGroup;
