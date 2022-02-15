import React from "react";
import { Modal, Space, Button, Result, message } from "antd";
import {
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const NotificationModal = ({
  isMobile,
  isVisible,
  type,
  onOk,
  onCancel,
  savedLink,
}) => {
  const modalProps = () => {
    switch (type) {
      case "success":
        return {
          status: "success",
          icon: <CheckCircleOutlined />,
          title: "Form submitted successfully.",
          extra: (
            <Button size="large" className="button-next" onClick={onOk}>
              New Submission
            </Button>
          ),
        };
      case "save-success":
        return {
          status: "success",
          icon: <CheckCircleOutlined />,
          title: "Form instance saved successfully.",
          subTitle: `Saved link: ${savedLink}`,
          extra: (
            <Space direction="vertical">
              <Button
                size="large"
                onClick={() => {
                  navigator.clipboard.writeText(savedLink);
                  message.info("Copied to clipboard!");
                }}
              >
                Copy to clipboard
              </Button>
              <Button size="large" className="button-next" onClick={onCancel}>
                Close
              </Button>
            </Space>
          ),
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
          status: "error",
          icon: <ExclamationCircleOutlined />,
          title: "Error, something went wrong!",
          extra: (
            <Button size="large" className="button-next" onClick={onCancel}>
              Close
            </Button>
          ),
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
      wrapClassName={"notification-modal-wrap"}
      width={isMobile ? "90%" : "520px"}
    >
      <Result {...modalProps()} />
    </Modal>
  );
};

export default NotificationModal;
