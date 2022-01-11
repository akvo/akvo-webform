import React from "react";
import { Form, Input, InputNumber } from "antd";
import Label from "../components/Label";

const TypeInput = ({
  id,
  text,
  keyform,
  mandatory,
  rules,
  help,
  validationRule,
}) => {
  return (
    <Form.Item
      className="field"
      key={keyform}
      name={id}
      label={<Label keyform={keyform} text={text} help={help} />}
      rules={rules}
      required={mandatory}
    >
      {validationRule?.validationType === "numeric" ? (
        <InputNumber sytle={{ width: "100%" }} />
      ) : (
        <Input sytle={{ width: "100%" }} />
      )}
    </Form.Item>
  );
};

export default TypeInput;
