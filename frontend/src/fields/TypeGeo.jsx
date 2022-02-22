import React, { useState } from "react";
import { Col, Form, Input } from "antd";
import { Label } from "../components";
import Maps from "./support/Maps";
import dataProviders from "../store";
import { checkFilledForm } from "../lib/form";

const TypeGeo = ({
  id,
  form,
  text,
  keyform,
  mandatory,
  rules,
  help,
  altText,
}) => {
  const geoAnswer = form.getFieldValue(id);
  const [position, setPosition] = useState({
    lat: geoAnswer?.lat || null,
    lng: geoAnswer?.lng || null,
  });
  const [value, setValue] = useState(null);
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { forms, dataPointName } = state;
  const { questionGroup } = forms;

  const updateCompleteState = (value) => {
    setValue(value);
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

  const changePos = (newPos) => {
    setPosition(newPos);
    if (newPos?.lat && newPos?.lng) {
      updateCompleteState(newPos);
    } else {
      updateCompleteState(null);
    }
  };

  const onChange = (cname, e) => {
    if (!e) {
      changePos({ lat: null, lng: null });
    } else {
      changePos({ ...position, [cname]: e !== null ? parseFloat(e) : null });
    }
  };

  return (
    <Col key={keyform}>
      <Form.Item
        className="field"
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
        <Input value={value} disabled hidden />
      </Form.Item>
      <Maps
        setValue={setValue}
        id={id}
        position={position}
        onChange={onChange}
        changePos={changePos}
      />
    </Col>
  );
};

export default TypeGeo;
