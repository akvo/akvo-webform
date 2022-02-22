import React from "react";
import { Form, DatePicker } from "antd";
import { Label } from "../components";

const TypeDate = ({ id, text, keyform, mandatory, rules, help, altText }) => {
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
          altText={altText}
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
