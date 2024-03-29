import React, { useState, useEffect } from "react";
import { Space, Form, Radio, Checkbox, Progress, Spin, Input } from "antd";
import { Label } from "../components";
import dataProviders from "../store";
import api from "../lib/api";
import { roundValue, generateAnswerStatsURL } from "../lib/util";

const TypeOption = ({
  options,
  id,
  text,
  keyform,
  mandatory,
  rules,
  help,
  altText,
  answerStats,
}) => {
  const option = options.option;
  const allowOther = options?.allowOther;
  const [values, setValues] = useState([]);
  const { language } = dataProviders.Values();
  const activeLang = language?.active;

  const otherOptionInputName = `${id}-other`;

  // stats
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsData, setStatsData] = useState({});
  const isStatsData = Object.values(statsData).length;
  const url = generateAnswerStatsURL(id);

  useEffect(() => {
    // fetch answer stats value
    if (answerStats && !isStatsData) {
      setLoadingStats(true);
      api
        .get(url)
        .then((res) => {
          let stats = {};
          const { data } = res;
          const total = Object.values(data).reduce((curr, val) => curr + val);
          Object.keys(data).forEach((key) => {
            const currValue = data[key];
            const percent = roundValue((currValue / total) * 100, 1);
            stats = {
              ...stats,
              [key]: (
                <>
                  <Progress percent={percent} steps={5} showInfo={false} />{" "}
                  {percent}%
                </>
              ),
            };
          });
          setStatsData(stats);
        })
        .finally(() => setLoadingStats(false));
    }
  }, [url, answerStats, isStatsData]);

  const renderQuestionAnswerLangText = (altText) => {
    const findLang = altText?.find((x) => x?.language === activeLang);
    return findLang?.text ? (
      <>
        {" "}
        &#47; <span className="translation-text">{findLang.text}</span>
      </>
    ) : null;
  };

  const renderAnswerStats = (text) => {
    if (answerStats && loadingStats) {
      return (
        <span className="option-answer-stats-wrapper">
          <>
            <Progress percent={0} steps={5} showInfo={false} />{" "}
            <Spin size="small" />
          </>
        </span>
      );
    }
    if (answerStats && !loadingStats) {
      const stats = statsData?.[text];
      return (
        <span className="option-answer-stats-wrapper">
          {stats ? (
            stats
          ) : (
            <>
              <Progress percent={0} steps={5} showInfo={false} /> 0%
            </>
          )}
        </span>
      );
    }
    return null;
  };

  const onRadioGroupChange = ({ target: { value } }) => {
    setValues([value]);
  };

  const onCheckboxGroupChange = (values) => {
    setValues(values);
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
        <Checkbox.Group
          style={{ width: "100%" }}
          onChange={onCheckboxGroupChange}
        >
          <Space direction="vertical">
            {option.map((o, io) => (
              <Checkbox key={io} value={o.value}>
                {o.text}
                {renderQuestionAnswerLangText(o?.altText)}
                {renderAnswerStats(o.text)}
              </Checkbox>
            ))}
            {allowOther ? (
              <Checkbox value="%other%">
                {values.includes("%other%") ? (
                  <Form.Item
                    name={otherOptionInputName}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please input other answer",
                      },
                    ]}
                    noStyle
                  >
                    <Input placeholder="Type other answer" autoFocus />
                  </Form.Item>
                ) : (
                  "Other..."
                )}
              </Checkbox>
            ) : null}
          </Space>
        </Checkbox.Group>
      ) : (
        <Radio.Group onChange={onRadioGroupChange}>
          <Space direction="vertical">
            {option.map((o, io) => (
              <Radio key={io} value={o.value}>
                {o.text}
                {renderQuestionAnswerLangText(o?.altText)}
                {renderAnswerStats(o.text)}
              </Radio>
            ))}
            {allowOther ? (
              <Radio value="%other%">
                {values.includes("%other%") ? (
                  <Form.Item
                    name={otherOptionInputName}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please input other answer",
                      },
                    ]}
                    noStyle
                  >
                    <Input placeholder="Type other answer" autoFocus />
                  </Form.Item>
                ) : (
                  "Other..."
                )}
              </Radio>
            ) : null}
          </Space>
        </Radio.Group>
      )}
    </Form.Item>
  );
};

export default TypeOption;
