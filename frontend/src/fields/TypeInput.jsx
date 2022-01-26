import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber } from "antd";
import Label from "../components/Label";
import { checkFilledForm } from "../lib/form";
import dataProviders from "../store";

const DoubleEntry = ({ id, number, error, setDoubleEntryValue }) => {
  return (
    <>
      {number ? (
        <InputNumber
          key={`de-${id}`}
          style={{ width: "100%" }}
          onChange={(e) => setDoubleEntryValue(e)}
        />
      ) : (
        <Input
          key={`de-${id}`}
          onChange={(e) => setDoubleEntryValue(e?.target?.value)}
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
}) => {
  const [value, setValue] = useState(null);
  const [doubleEntryError, setDoubleEntryError] = useState(false);
  const [doubleEntryValue, setDoubleEntryValue] = useState(null);
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { forms, dataPointName } = state;
  const { questionGroup } = forms;

  const updateCompleteState = (value) => {
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
    console.log(errorFields, formValues, completeQg);
    dispatch({
      type: "UPDATE GROUP",
      payload: {
        complete: completeQg.flatMap((qg) => qg.i),
      },
    });
  };

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
      updateCompleteState(null);
    }
  }, [doubleEntryValue, doubleEntryError, value]);

  return (
    <div>
      {requireDoubleEntry ? (
        <>
          <Form.Item
            className="field"
            name={id}
            label={
              <Label
                keyform={keyform}
                text={text}
                help={help}
                mandatory={mandatory}
                requireDoubleEntry={requireDoubleEntry}
              />
            }
            rules={rules}
            required={false}
          >
            <Input value={value} disabled hidden />
          </Form.Item>
          <div className="field-double-entry" style={{ marginTop: "-62px" }}>
            {validationRule?.validationType === "numeric" ? (
              <InputNumber onChange={(val) => setFirstDoubleEntryValue(val)} />
            ) : (
              <Input
                onChange={(val) => setFirstDoubleEntryValue(val?.target?.value)}
              />
            )}
          </div>
          <div className="field-double-entry" style={{ marginTop: "35px" }}>
            <DoubleEntry
              id={id}
              number={validationRule?.validationType === "numeric"}
              error={doubleEntryError}
              setDoubleEntryValue={setDoubleEntryValue}
            />
          </div>
        </>
      ) : (
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
              requireDoubleEntry={requireDoubleEntry}
            />
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
