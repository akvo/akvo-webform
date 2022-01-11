import React from "react";
import { Space, Form, Radio, Select, Checkbox } from "antd";

const TypeOption = ({
  options,
  id,
  text,
  keyform,
  required,
  rules,
  tooltip,
}) => {
  const { option } = options;
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
      {options?.allowMultiple ? (
        <Checkbox.Group style={{ width: "100%" }}>
          <Space direction="vertical">
            {option.map((o, io) => (
              <Checkbox key={io} value={o.value}>
                {o.text}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      ) : (
        <Radio.Group>
          <Space direction="vertical">
            {option.map((o, io) => (
              <Radio key={io} value={o.value}>
                {o.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      )}
    </Form.Item>
  );
};

export default TypeOption;
