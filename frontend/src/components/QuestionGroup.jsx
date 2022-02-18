import React from "react";
import { Card, Button, Row, Col } from "antd";
import { MdDelete } from "react-icons/md";
import Question from "./Question";
import FieldGroupHeader from "./FieldGroupHeader";
import range from "lodash/range";
import { updateRepeat } from "../lib/form";
import dataProviders from "../store";

const DeleteSelectedRepeatButton = ({ index, group, repeat }) => {
  const state = dataProviders.Values();
  const dispatch = dataProviders.Actions();

  if (group?.repeat <= 1) {
    return "";
  }

  return (
    <Button
      type="link"
      className="repeat-delete-btn"
      icon={<MdDelete className="icon" />}
      onClick={() =>
        updateRepeat(
          group?.repeat - 1,
          index,
          state,
          dispatch,
          "delete-selected",
          repeat
        )
      }
    />
  );
};

const RepeatTitle = ({ index, group, repeat }) => {
  return (
    <div className="repeat-title">
      <Row justify="space-between" align="middle">
        <Col span={20} align="start">
          {group?.heading}-{repeat + 1}
        </Col>
        <Col span={4} align="end">
          <DeleteSelectedRepeatButton
            index={index}
            group={group}
            repeat={repeat}
          />
        </Col>
      </Row>
    </div>
  );
};

const QuestionGroup = ({ form, questionGroup, active, group }) => {
  const repeats =
    group?.repeats && group?.repeats?.length
      ? group.repeats
      : range(group.repeat);
  return (
    <Card
      title={<FieldGroupHeader {...group} />}
      className={`field-group ${active !== group.index ? "hidden" : ""} ${
        group.index === questionGroup?.length ? "last" : ""
      }`}
    >
      {repeats.map((r) => (
        <div key={r}>
          {group?.repeatable && (
            <RepeatTitle index={group?.index} group={group} repeat={r} />
          )}
          <Question
            group={group}
            repeat={r}
            fields={group.question}
            form={form}
          />
        </div>
      ))}
    </Card>
  );
};

export default QuestionGroup;
