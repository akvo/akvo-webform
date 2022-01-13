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
      form.setFieldsValue({ [id]: newPos });
    }
  };

  const onChange = (cname, e) => {
    changePos({ ...position, [cname]: parseFloat(e) });
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
        form={form}
        setValue={setValue}
        id={id}
        center={{ lat: 0, lng: 0 }}
        position={position}
        onChange={onChange}
        changePos={changePos}
      />
    </Col>
  );
};

export default TypeGeo;
