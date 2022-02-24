import React, { useEffect } from "react";
import { Modal, Space, Button, Result, message, InputNumber } from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const CaptchaNumber = () => {
  useEffect(() => {
    const captchaNumber = document.getElementById("captcha-number");
    if (captchaNumber && captchaNumber.childNodes[0]) {
      captchaNumber.removeChild(captchaNumber.childNodes[0]);
    }
    const validatorX = Math.floor(Math.random() * 9) + 1;
    const validatorY = Math.floor(Math.random() * 9) + 1;
    let canv = document.createElement("canvas");
    canv.width = 200;
    canv.height = 50;
    let ctx = canv.getContext("2d");
    ctx.font = "35px Assistant, sans-serif";
    ctx.textAlign = "center";
    ctx.strokeText(validatorX + "+" + validatorY, 100, 38);
    captchaNumber.appendChild(canv);
  }, []);

  return (
    <Space align="center" direction="vertical">
      <div id="captcha-number"></div>
      <InputNumber size="large" onChange={(e) => console.log(e)} />
    </Space>
  );
};

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
          title: "Submission saved successfully.",
          subTitle: (
            <Space direction="vertical">
              <div className="info-text">
                Not for sharing! This link only functional on your current
                browser.
              </div>
              <div>{`Saved link: ${savedLink}`}</div>
            </Space>
          ),
          extra: (
            <Space direction="vertical">
              <Button
                size="large"
                className="button-next"
                onClick={() => {
                  navigator.clipboard.writeText(savedLink);
                  message.info("Copied to clipboard!");
                }}
              >
                Copy to clipboard
              </Button>
              <Button
                size="large"
                className="button-default"
                onClick={onCancel}
              >
                Close
              </Button>
            </Space>
          ),
        };
      case "clear":
        return {
          status: "warning",
          icon: <WarningOutlined />,
          title: "Clear all data entered in the form?",
          extra: (
            <Space>
              <Button size="large" onClick={onOk} type="danger">
                Yes, clear it
              </Button>
              <Button
                size="large"
                className="button-default"
                onClick={onCancel}
              >
                No, keep it
              </Button>
            </Space>
          ),
        };
      case "submit-failed":
        return {
          status: "error",
          icon: <ExclamationCircleOutlined />,
          title: "Please fill in all required questions.",
          extra: (
            <Button size="large" className="button-default" onClick={onCancel}>
              Close
            </Button>
          ),
        };
      case "delete-saved-submission":
        return {
          status: "warning",
          icon: <WarningOutlined />,
          title: "Are you sure want to delete this submission?",
          extra: (
            <Space>
              <Button size="large" onClick={onOk} type="danger">
                Delete
              </Button>
              <Button
                size="large"
                className="button-default"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </Space>
          ),
        };
      case "captcha":
        return {
          icon: <CaptchaNumber render={isVisible} />,
          title: "",
          extra: (
            <Space>
              <Button size="large" className="button-next" onClick={onOk}>
                Submit
              </Button>
              <Button
                size="large"
                className="button-default"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </Space>
          ),
        };
      default:
        return {
          status: "error",
          icon: <ExclamationCircleOutlined />,
          title: "Error, something went wrong!",
          extra: (
            <Button size="large" className="button-default" onClick={onCancel}>
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
      width={isMobile ? "75%" : "520px"}
    >
      <Result {...modalProps()} />
    </Modal>
  );
};

export default NotificationModal;
