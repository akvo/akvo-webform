import React from "react";
import { Form, DatePicker } from "antd";
import Label from "../components/Label";

const TypeDate = ({ id, text, keyform, mandatory, rules, help }) => {
  return (
    <Form.Item
      className="field"
      key={keyform}
      name={id}
      label={
        <Label
          keyform={keyform}
          text={text}
          help={help}
          mandatory={mandatory}
        />
      }
      rules={rules}
      required={false}
    >
      <DatePicker style={{ width: "100%" }} />
    </Form.Item>
  );
};

export default TypeDate;
