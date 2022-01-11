import React from "react";
import { Form, Input } from "antd";

const TypeInput = ({ id, text, keyform, required, rules, tooltip }) => {
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
      <Input sytle={{ width: "100%" }} />
    </Form.Item>
  );
};

export default TypeInput;
