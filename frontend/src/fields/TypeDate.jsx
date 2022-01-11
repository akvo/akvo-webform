import React from "react";
import { Form, DatePicker } from "antd";

const TypeDate = ({ id, text, keyform, required, rules, help }) => {
  return (
    <Form.Item
      className="field"
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${text}`}
      rules={rules}
      required={required}
    >
      <DatePicker style={{ width: "100%" }} />
    </Form.Item>
  );
};

export default TypeDate;
