import React, { useState } from "react";
import { Upload, Form } from "antd";
import Label from "../components/Label";
import { BsCardImage } from "react-icons/bs";

const { Dragger } = Upload;

const TypeFile = ({ id, text, form, keyform, mandatory, rules, help }) => {
  const [blob, setBlob] = useState(null);

  const onCollect = ({ file, onSuccess }) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setBlob(reader.result);
    });
    reader.readAsDataURL(file);
    onSuccess("ok");
  };

  const onRemove = () => {
    setBlob(null);
  };

  const props = {
    name: id,
    multiple: false,
    maxCount: 1,
    customRequest: onCollect,
    onRemove: onRemove,
  };

  const formFile = (e) => {
    if (Array.isArray(e)) {
      return e.length ? e : null;
    }
    return e && e.fileList?.length ? e.fileList : null;
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
        />
      }
      rules={rules}
      required={false}
      valuePropName="file"
      getValueFromEvent={formFile}
    >
      <Dragger {...props}>
        <div
          className="image-container"
          style={blob ? { backgroundImage: `url("${blob}")` } : {}}
        ></div>
        <div className="text-container">
          <p className="ant-upload-drag-icon">
            <BsCardImage />
          </p>

          <p className="ant-upload-text">Drop Image Here to Upload</p>
          <p className="ant-upload-hint">Max file size: 1mb</p>
        </div>
      </Dragger>
    </Form.Item>
  );
};

export default TypeFile;
