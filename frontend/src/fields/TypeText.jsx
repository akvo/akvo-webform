import React from "react";
import { Form } from "antd";
import TextArea from "antd/lib/input/TextArea";
import Label from "../components/Label";

const TypeText = ({ id, text, keyform, mandatory, rules, help }) => {
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
      <TextArea row={4} />
    </Form.Item>
  );
};

export default TypeText;
