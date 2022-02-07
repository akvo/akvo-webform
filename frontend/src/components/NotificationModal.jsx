import React from "react";
import { Modal, Space, Button, Result } from "antd";
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const NotificationModal = ({ isVisible, type, onOk, onCancel }) => {
  const modalProps = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircleOutlined />,
          title: "Form submitted successfully.",
          extra: <Button onClick={onOk}>New Submission</Button>,
        };
      case "clear":
        return {
          icon: <QuestionCircleOutlined />,
          title: "Clear all data entered in the form?",
          extra: (
            <Space size={75}>
              <Button onClick={onOk} type="danger">
                Yes, clear it
              </Button>
              <Button onClick={onCancel}>No, keep it</Button>
            </Space>
          ),
        };
      default:
        return {
          icon: <ExclamationCircleOutlined />,
          title: "Error, something went wrong!",
          extra: <Button onClick={onCancel}>Close</Button>,
        };
    }
  };

  return (
    <Modal
      visible={isVisible}
      title={null}
      footer={null}
      centered={true}
      zIndex={9999}
      closable={false}
    >
      <Result {...modalProps()} />
    </Modal>
  );
};

export default NotificationModal;
