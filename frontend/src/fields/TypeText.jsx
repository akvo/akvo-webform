import React from "react";
import { Form } from "antd";
import TextArea from "antd/lib/input/TextArea";

const TypeText = ({ id, text, keyform, required, rules, tooltip }) => {
  return (
    <Form.Item
      className="arf-field"
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${text}`}
      rules={rules}
      required={required}
      tooltip={tooltip?.text}
    >
      <TextArea row={4} />
    </Form.Item>
  );
};

export default TypeText;
