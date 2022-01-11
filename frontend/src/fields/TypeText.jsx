import React from "react";
import { Form } from "antd";
import TextArea from "antd/lib/input/TextArea";

const TypeText = ({ id, text, keyform, required, rules, help }) => {
  return (
    <Form.Item
      className="field"
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${text}`}
      rules={rules}
      required={required}
    >
      <TextArea row={4} />
    </Form.Item>
  );
};

export default TypeText;
