import React from "react";
import { Form } from "antd";
import TextArea from "antd/lib/input/TextArea";
import Label from "../components/Label";

const TypeText = ({ id, text, keyform, required, rules, help }) => {
  return (
    <Form.Item
      className="field"
      key={keyform}
      name={id}
      rules={rules}
      required={required}
      label={<Label keyform={keyform} text={text} help={help} />}
    >
      <TextArea row={4} />
    </Form.Item>
  );
};

export default TypeText;
