import React, { useState, useEffect } from "react";
import { Space, Form, Select } from "antd";
import Label from "../components/Label";
import api from "../lib/api";
import { findLast, take } from "lodash";
import dataProviders from "../store";
import { checkFilledForm } from "../lib/form";

const { Option } = Select;

const TypeCascade = ({
  id,
  text,
  keyform,
  mandatory,
  rules,
  help,
  levels,
  form,
  cascadeResource,
}) => {
  const state = dataProviders.Values();
  const { level } = levels;
  const { forms, dataPointName } = state;
  const dispatch = dataProviders.Actions();
  const { questionGroup } = forms;
  const [stored, setStored] = useState([]);
  const alias = forms?.alias?.split(".")[0];
  let tail = findLast(stored);
  tail = tail?.id || tail?.name || tail;
  const [cascadeValues, setCascadeValues] = useState([]);

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
    dispatch({
      type: "UPDATE GROUP",
      payload: {
        complete: completeQg.flatMap((qg) => qg.i),
      },
    });
  };

  const handleChange = (index, val) => {
    let updatedValues = cascadeValues.map((cv, cvi) => {
      const findCv = cv?.options?.find((x) => x?.id === val || x?.name === val);
      if (cvi === index) {
        return { ...cv, value: findCv || val };
      }
      return cv;
    });
    updatedValues = take(updatedValues, index + 1);
    const formVal = updatedValues.map((u) => u.value);
    setStored(formVal);
    setCascadeValues(updatedValues);
    if (formVal.length === level.length) {
      updateCompleteState(formVal);
    } else {
      updateCompleteState(null);
    }
  };

  useEffect(() => {
    if (cascadeValues.length === 0) {
      api
        .get(`cascade/${alias}/${cascadeResource}/0`)
        .then((res) => {
          setCascadeValues([{ options: res.data, ...level[0] }]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (cascadeValues.length && tail && cascadeValues.length < level.length) {
      api
        .get(`cascade/${alias}/${cascadeResource}/${tail}`)
        .then((res) => {
          setCascadeValues([
            ...cascadeValues,
            {
              options: res.data,
              ...level[cascadeValues.length + 1],
            },
          ]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [cascadeValues, tail]);

  const invalid = mandatory && stored?.length !== level.length;

  return (
    <div className="field-cascade">
      <Form.Item
        className="field"
        key={keyform}
        name={id}
        label={""}
        rules={rules}
        required={false}
        noStyle
      >
        <Select id={id} mode="multiple" options={[]} />
      </Form.Item>
      <div className="cascade">
        <Label
          keyform={keyform}
          text={text}
          help={help}
          mandatory={mandatory}
        />
      </div>
      {cascadeValues.map((x, xi) => (
        <div key={`cascade-${xi}`} className="cascade">
          <Select
            showSearch={true}
            className="cascade-list"
            onChange={(e) => handleChange(xi, e)}
            placeholder={`Select ${level[xi].text}`}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            value={
              form.getFieldValue(id)?.[xi]?.id ||
              form.getFieldValue(id)?.[xi]?.name
            }
          >
            {x?.options?.map((o, oi) => (
              <Option key={oi} value={o.id}>
                {o.name}
              </Option>
            ))}
          </Select>
        </div>
      ))}
      {invalid && <div className="error-cascade">{text} is required</div>}
    </div>
  );
};

export default TypeCascade;
