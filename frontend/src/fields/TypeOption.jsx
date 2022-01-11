import React from "react";
import { Space, Form, Radio, Checkbox } from "antd";
import Label from "../components/Label";

const TypeOption = ({ options, id, text, keyform, mandatory, rules, help }) => {
  const { option } = options;
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
