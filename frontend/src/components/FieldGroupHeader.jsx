import React from "react";
import { Row, Col, Input, Button } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { MdRepeat } from "react-icons/md";

const FieldGroupHeader = ({ index, heading, repeatable, state, dispatch }) => {
  const { forms } = state;
  const current = forms?.questionGroup.find((x) => x.index === index);
  const { repeat } = current;
  const updateRepeat = (value) => {
    const updated = forms.questionGroup.map((x) => {
      if (x.index === index) {
        return { ...current, repeat: value };
      }
      return x;
    });
    dispatch({
      type: "UPDATE FORM",
      forms: { ...state.forms, questionGroup: updated },
    });
  };
  if (!repeatable) {
    return <div className="field-group-header">{heading}</div>;
  }
  return (
    <div className="field-group-header">
      <div className="field-group-heading">{heading}</div>
      {repeatable && (
        <div className="field-group-heading">
          <MdRepeat className="icon" />
        </div>
      )}
      <Row align="middle">
        <Col span={24} className="repeat-input">
          <div className="field-title">Number of {heading}</div>
          <Input.Group className="field" compact>
            <Button
              icon={<MinusOutlined />}
              onClick={() => updateRepeat(repeat - 1)}
              disabled={repeat < 2}
              className={repeat < 2 ? "disabled" : ""}
            />
            <Input
              style={{ width: "40px", textAlign: "center" }}
              value={repeat}
              defaultValue={repeat}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={() => updateRepeat(repeat + 1)}
            />
          </Input.Group>
        </Col>
      </Row>
    </div>
  );
};

export default FieldGroupHeader;
