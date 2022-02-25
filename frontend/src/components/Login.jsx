import React, { useMemo, useState } from "react";
import { Row, Col, Form, Input, Button, Typography, Space } from "antd";
import dataProviders from "../store";

const { Text, Link } = Typography;

const Login = () => {
  const { forms, auth } = dataProviders.Values();
  const { surveyGroupName, name } = forms;
  const dispatch = dataProviders.Actions();
  const [isAuthError, setIsAuthError] = useState(false);

  const onFinish = (values) => {
    if (auth?.password === values?.password) {
      const payload = {
        ...values,
        isLogin: true,
      };
      dispatch({ type: "LOGIN", payload: payload });
    } else {
      setIsAuthError(true);
    }
  };

  const surveyTitle = useMemo(() => {
    return surveyGroupName && name
      ? `${surveyGroupName} - ${name}`
      : "Loading...";
  }, [surveyGroupName, name]);

  const authError = useMemo(() => {
    return isAuthError ? (
      <Text type="danger">Your password doesn't match!</Text>
    ) : (
      ""
    );
  }, [isAuthError]);

  return (
    <div className="main login-container">
      <Row align="middle" justify="center" className="login-header-wrapper">
        <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
          <div className="login-header">
            <h1 className="logo">
              <img src="/favicon-96x96.png" alt="akvoflow-webforms-logo" />
            </h1>
            <h1>AkvoFlow WebForms</h1>
          </div>
        </Col>
      </Row>
      <Row align="middle" justify="center">
        <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
          <div className="survey-title-wrapper">
            <h2>{surveyTitle}</h2>
          </div>
          <div className="login-form">
            <div className="login-form-title">
              <h4>Log in to submit data</h4>
              {authError}
            </div>
            <Form
              name="login"
              layout="vertical"
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              onFinish={onFinish}
            >
              <Form.Item
                label="Submitter name"
                name="submitter"
                rules={[
                  { required: true, message: "Submitter name required." },
                ]}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item
                label={
                  <Space direction="vertical" size={0}>
                    Form Password
                    <Text italic>
                      * please contact administrator for the password.
                    </Text>
                  </Space>
                }
                name="password"
                rules={[{ required: true, message: "Password required." }]}
              >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="button-next"
                  size="large"
                  block
                >
                  Start
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div className="login-footer">
            <Text>
              AkvoFlow Webforms enabling remote Byod data collection.{" "}
            </Text>
            <Link>Data policy</Link>.{" "}
            <Link href="https://akvo.org/" target="_blank">
              Akvo.org
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
