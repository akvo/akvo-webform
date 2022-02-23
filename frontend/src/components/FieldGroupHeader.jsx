import React, { useMemo } from "react";
import { Row, Col, Input, Button } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { MdRepeat } from "react-icons/md";
import dataProviders from "../store";
import { updateRepeat } from "../lib/form";

const FieldGroupHeader = ({ index, heading, repeatable, altText }) => {
  const state = dataProviders.Values();
  const dispatch = dataProviders.Actions();
  const { forms, language } = state;
  const current = forms.questionGroup.find((x) => x.index === index);
  const activeLang = language?.active;

  const langText = useMemo(() => {
    const findLang = altText?.find((x) => x?.language === activeLang);
    return findLang?.text ? (
      <>
        {" "}
        &#47; <span className="translation-text">{findLang.text}</span>
      </>
    ) : (
      ""
    );
  }, [altText, activeLang]);

  if (!repeatable) {
    return (
      <div className="field-group-header">
        {heading}
        {langText}
      </div>
    );
  }

  const { repeat } = current;

  return (
    <div className="field-group-header">
      <div className="field-group-heading">
        {heading}
        {langText}
      </div>
      {repeatable && (
        <div className="field-group-heading">
          <MdRepeat className="icon" />
        </div>
      )}
      <Row align="middle">
        <Col span={24} className="repeat-input">
          <div className="field-title">Number of {heading}</div>
          <Input.Group className="field" compact>
            <Button
              icon={<MinusOutlined />}
              onClick={() =>
                updateRepeat(repeat - 1, index, state, dispatch, "delete")
              }
              disabled={repeat < 2}
              className={repeat < 2 ? "disabled" : ""}
            />
            <Input
              style={{ width: "40px", textAlign: "center" }}
              value={repeat}
              disabled
            />
            <Button
              icon={<PlusOutlined />}
              onClick={() =>
                updateRepeat(repeat + 1, index, state, dispatch, "add")
              }
            />
          </Input.Group>
        </Col>
      </Row>
    </div>
  );
};

export default FieldGroupHeader;
