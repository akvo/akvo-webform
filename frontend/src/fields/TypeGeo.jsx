import React, { useState } from "react";
import { Col, Form, Input } from "antd";
import { Label } from "../components";
import Maps from "./support/Maps";

const TypeGeo = ({ id, form, text, keyform, mandatory, rules, help }) => {
  const [position, setPosition] = useState({ lat: null, lng: null });
  const [value, setValue] = useState(null);

  const changePos = (newPos) => {
    setPosition(newPos);
    if (newPos?.lat && newPos?.lng) {
      setValue(newPos);
      form.setFieldsValue({ [id]: newPos });
    } else {
      setValue(null);
      form.setFieldsValue({ [id]: null });
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
