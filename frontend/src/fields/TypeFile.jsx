import React from "react";
import { Upload, Form, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Label from "../components/Label";
import { BsCardImage } from "react-icons/bs";

const { Dragger } = Upload;

const TypeFile = ({ id, text, keyform, mandatory, rules, help }) => {
  const props = {
    name: "file",
    multiple: true,
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
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
    >
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <BsCardImage />
        </p>
        <p className="ant-upload-text">Drop Image Here to Upload</p>
        <p className="ant-upload-hint">Max file size: 1mb</p>
      </Dragger>
    </Form.Item>
  );
};

export default TypeFile;
