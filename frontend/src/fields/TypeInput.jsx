import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, InputNumber, Spin, Space } from "antd";
import { Label } from "../components";
import { checkFilledForm } from "../lib/form";
import dataProviders from "../store";
import api from "../lib/api";
import { roundValue, generateAnswerStatsURL } from "../lib/util";

const DoubleEntry = ({
  id,
  number,
  error,
  setDoubleEntryValue,
  doubleEntryValue,
}) => {
  return (
    <>
      {number ? (
        <InputNumber
          key={`de-${id}`}
          style={{ width: "100%" }}
          onChange={(e) => setDoubleEntryValue(e)}
          value={doubleEntryValue}
        />
      ) : (
        <Input
          key={`de-${id}`}
          onChange={(e) => setDoubleEntryValue(e?.target?.value)}
          value={doubleEntryValue}
        />
      )}
      {error && <div className="error-double-entry">Invalid Double Entry</div>}
    </>
  );
};

const TypeInput = ({
  id,
  text,
  keyform,
  mandatory,
  rules,
  help,
  validationRule,
  requireDoubleEntry,
  form,
  altText,
  answerStats,
}) => {
  const inputAnswer = form.getFieldValue(id);
  const [value, setValue] = useState(inputAnswer || null);
  const [doubleEntryError, setDoubleEntryError] = useState(false);
  const [doubleEntryValue, setDoubleEntryValue] = useState(inputAnswer || null);
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { forms, dataPointName } = state;
  const { questionGroup } = forms;

  // stats
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const isStatsData = statsData.length;
  const url = generateAnswerStatsURL(id);

  useEffect(() => {
    // fetch answer stats value
    if (answerStats && !isStatsData) {
      setLoadingStats(true);
      api
        .get(url)
        .then((res) => {
          const { data } = res;
          const stats = Object.keys(data)
            .filter((key) => key !== "sd")
            .map((key) => {
              const currValue = data[key];
              const name = key === "sd" ? "standard deviation" : key;
              return {
                name: name,
                value: currValue,
              };
            });
          setStatsData(stats);
        })
        .finally(() => setLoadingStats(false));
    }
  }, [url, answerStats, isStatsData]);

  const renderAnswerStats = () => {
    if (answerStats && loadingStats) {
      return (
        <div className="input-answer-stats-wrapper">
          <Spin size="small" />
        </div>
      );
    }
    if (answerStats && isStatsData && !loadingStats) {
      return (
        <div className="input-answer-stats-wrapper">
          <Space align="center">
            {statsData.map((sd, sdi) => (
              <span key={`stat-${sdi}`} className="input-answer-stats-item">
                {sd.name} : {roundValue(sd.value, 2)}
              </span>
            ))}
          </Space>
        </div>
      );
    }
    return null;
  };

  const updateCompleteState = useCallback(
    (value) => {
      const answer = { [id]: value };
      form.setFieldsValue(answer);
      const errorFields = form.getFieldsError();
      const formValues = form.getFieldsValue();
      const { completeQg } = checkFilledForm(
        errorFields,
        dataPointName,
        questionGroup,
        answer,
        formValues
      );
      dispatch({
        type: "UPDATE GROUP",
        payload: {
          complete: completeQg.flatMap((qg) => qg.i),
        },
      });
    },
    [dataPointName, dispatch, form, id, questionGroup]
  );

  const setFirstDoubleEntryValue = (val) => {
    setValue(val);
    if (!val) {
      form.setFieldsValue({ [id]: null });
    }
  };

  useEffect(() => {
    if (requireDoubleEntry) {
      setDoubleEntryError((null || value) !== doubleEntryValue);
    }
    if (requireDoubleEntry && !doubleEntryError && doubleEntryValue) {
      updateCompleteState(value);
    } else {
      updateCompleteState(inputAnswer || null);
    }
  }, [
    doubleEntryValue,
    doubleEntryError,
    value,
    inputAnswer,
    requireDoubleEntry,
    updateCompleteState,
  ]);

  return (
    <div>
      {requireDoubleEntry ? (
        <>
          <Form.Item
            className="field"
            name={id}
            label={
              <>
                <Label
                  keyform={keyform}
                  text={text}
                  help={help}
                  mandatory={mandatory}
                  requireDoubleEntry={requireDoubleEntry}
                  altText={altText}
                />
                {renderAnswerStats()}
              </>
            }
            rules={rules}
            required={false}
          >
            <Input value={value} disabled hidden />
          </Form.Item>
          <div className="field-double-entry" style={{ marginTop: "-56px" }}>
            {validationRule?.validationType === "numeric" ? (
              <InputNumber
                onChange={(val) => setFirstDoubleEntryValue(val)}
                value={value}
              />
            ) : (
              <Input
                onChange={(val) => setFirstDoubleEntryValue(val?.target?.value)}
                value={value}
              />
            )}
          </div>
          <div className="field-double-entry" style={{ marginTop: "25px" }}>
            <DoubleEntry
              id={id}
              number={validationRule?.validationType === "numeric"}
              error={doubleEntryError}
              setDoubleEntryValue={setDoubleEntryValue}
              doubleEntryValue={doubleEntryValue}
            />
          </div>
        </>
      ) : (
        <Form.Item
          className="field"
          key={keyform}
          name={id}
          label={
            <>
              <Label
                keyform={keyform}
                text={text}
                help={help}
                mandatory={mandatory}
                requireDoubleEntry={requireDoubleEntry}
                altText={altText}
              />
              {renderAnswerStats()}
            </>
          }
          rules={rules}
          required={false}
        >
          {validationRule?.validationType === "numeric" ? (
            <InputNumber />
          ) : (
            <Input />
          )}
        </Form.Item>
      )}
    </div>
  );
};

export default TypeInput;
