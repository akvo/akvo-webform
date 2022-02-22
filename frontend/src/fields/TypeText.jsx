import React from "react";
import { Form } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { Label } from "../components";

const TypeText = ({ id, text, keyform, mandatory, rules, help, altText }) => {
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
          altText={altText}
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
