import React, { useState, useEffect } from "react";
import { Space, Form, Select } from "antd";
import Label from "../components/Label";
import api from "../lib/api";
import { findLast, take } from "lodash";

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
  state,
  cascadeResource,
}) => {
  const { level } = levels;
  const { forms } = state;
  const alias = forms?.alias?.split(".")[0];
  const current = form.getFieldValue(id);
  const tail = findLast(current);
  const [cascadeValues, setCascadeValues] = useState([]);

  const handleChange = (index, val) => {
    let updatedValues = cascadeValues.map((cv, cvi) => {
      if (cvi === index) {
        return { ...cv, value: val };
      }
      return cv;
    });
    updatedValues = take(updatedValues, index + 1);
    const formVal = updatedValues.map((u) => u.value);
    form.setFieldsValue({ [id]: formVal });
    setCascadeValues(updatedValues);
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
    if (tail && cascadeValues.length < level.length) {
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

  const invalid = mandatory && current?.length !== level.length;

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
