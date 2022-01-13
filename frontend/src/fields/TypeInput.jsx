import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Col } from "antd";
import Label from "../components/Label";

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
  const [doubleEntryError, setDoubleEntryError] = useState(false);
  const [doubleEntryValue, setDoubleEntryValue] = useState(null);
  const answer = form.getFieldValue(id);

  const checkDoubleEntry = () => {
    if (requireDoubleEntry) {
      setDoubleEntryError((null || answer) !== doubleEntryValue);
    }
  };

  useEffect(() => {
    checkDoubleEntry(doubleEntryValue);
  }, [doubleEntryValue, answer]);

  return (
    <div>
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
          <InputNumber onChange={() => checkDoubleEntry()} />
        ) : (
          <Input onChange={() => checkDoubleEntry()} />
        )}
      </Form.Item>
      <div className="field-double-entry">
        {requireDoubleEntry && (
          <DoubleEntry
            id={id}
            number={validationRule?.validationType === "numeric"}
            error={doubleEntryError}
            setDoubleEntryValue={setDoubleEntryValue}
          />
        )}
      </div>
    </div>
  );
};

export default TypeInput;
