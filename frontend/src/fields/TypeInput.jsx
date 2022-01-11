import React from "react";
import { Form, Input, InputNumber } from "antd";
import Help from "../components/Help";

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
      label={`${keyform + 1}. ${text}`}
      rules={rules}
      required={mandatory}
    >
      {help && <Help {...help} />}
      {validationRule?.validationType === "numeric" ? (
        <InputNumber sytle={{ width: "100%" }} />
      ) : (
        <Input sytle={{ width: "100%" }} />
      )}
    </Form.Item>
  );
};

export default TypeInput;
