import React from "react";
import { Space, Form, Radio, Select } from "antd";

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
  console.log(options);
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
      {option.length < 3 ? (
        <Radio.Group>
          <Space direction="vertical">
            {option.map((o, io) => (
              <Radio key={io} value={o.value}>
                {o.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      ) : (
        <Select style={{ width: "100%" }} allowClear>
          {option.map((o, io) => (
            <Select.Option key={io} value={o.value}>
              {o.text}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

export default TypeOption;
