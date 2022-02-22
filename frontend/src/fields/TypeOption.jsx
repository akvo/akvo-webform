import React, { useMemo } from "react";
import { Space, Form, Radio, Checkbox } from "antd";
import { Label } from "../components";
import dataProviders from "../store";

const TypeOption = ({
  options,
  id,
  text,
  keyform,
  mandatory,
  rules,
  help,
  altText,
}) => {
  const { option } = options;
  const { language } = dataProviders.Values();
  const activeLang = language?.active;

  const renderLangText = (altText) => {
    const findLang = altText?.find((x) => x?.language === activeLang);
    return findLang?.text ? ` / ${findLang.text}` : "";
  };

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
      {options?.allowMultiple ? (
        <Checkbox.Group style={{ width: "100%" }}>
          <Space direction="vertical">
            {option.map((o, io) => (
              <Checkbox key={io} value={o.value}>
                {o.text}
                {renderLangText(o?.altText)}
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
                {renderLangText(o?.altText)}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      )}
    </Form.Item>
  );
};

export default TypeOption;
