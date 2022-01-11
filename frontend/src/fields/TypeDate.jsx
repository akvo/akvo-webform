import React from "react";
import { Form, DatePicker } from "antd";

const TypeDate = ({ id, text, keyform, required, rules, tooltip }) => {
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
      <DatePicker style={{ width: "100%" }} />
    </Form.Item>
  );
};

export default TypeDate;
