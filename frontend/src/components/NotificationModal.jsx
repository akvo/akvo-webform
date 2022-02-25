import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Space,
  Button,
  Result,
  message,
  InputNumber,
  Typography,
} from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const CaptchaNumber = ({ validateCaptcha, setValidateCaptcha }) => {
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaInputValue, setCaptchaInputValue] = useState(false);

  useEffect(() => {
    const captchaNumber = document.getElementById("captcha-number");
    if (captchaNumber && captchaNumber.childNodes[0]) {
      captchaNumber.removeChild(captchaNumber.childNodes[0]);
    }
    if (captchaNumber) {
      const validatorX = Math.floor(Math.random() * 9) + 1;
      const validatorY = Math.floor(Math.random() * 9) + 1;
      let canv = document.createElement("canvas");
      canv.width = 200;
      canv.height = 50;
      let ctx = canv.getContext("2d");
      ctx.font = "35px Assistant, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeText(validatorX + "+" + validatorY, 100, 38);
      setCaptchaValue(validatorX + validatorY);
      captchaNumber.appendChild(canv);
    }
  }, [setCaptchaValue]);

  const onChangeCaptchaInput = (value) => {
    setCaptchaInputValue(value);
    if (setValidateCaptcha) {
      setValidateCaptcha(value === captchaValue);
    }
  };

  const captchaError = useMemo(() => {
    return !validateCaptcha && captchaInputValue !== false ? (
      <Text type="danger">Please enter correct value</Text>
    ) : (
      ""
    );
  }, [validateCaptcha, captchaInputValue]);

  return (
    <Space align="center" direction="vertical">
      <div id="captcha-number"></div>
      <>
        <Space align="start" direction="vertical" size={5}>
          <InputNumber
            min={1}
            max={100}
            size="large"
            autoFocus={true}
            value={captchaInputValue}
            onChange={onChangeCaptchaInput}
          />
          {captchaError}
        </Space>
      </>
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
  const [validateCaptcha, setValidateCaptcha] = useState(false);

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
          icon: (
            <CaptchaNumber
              validateCaptcha={validateCaptcha}
              setValidateCaptcha={setValidateCaptcha}
            />
          ),
          title: "",
          extra: (
            <Space>
              <Button
                size="large"
                className="button-next"
                disabled={!validateCaptcha}
                onClick={onOk}
              >
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
      destroyOnClose={true}
    >
      <Result {...modalProps()} />
    </Modal>
  );
};

export default NotificationModal;
