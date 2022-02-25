import React, { useMemo } from "react";
import { Row, Col, Form, Input, Button, Typography } from "antd";
import dataProviders from "../store";

const { Text, Link } = Typography;

const Login = () => {
  const { forms } = dataProviders.Values();
  const { surveyGroupName, name } = forms;

  const surveyTitle = useMemo(() => {
    return surveyGroupName && name
      ? `${surveyGroupName} - ${name}`
      : "Loading...";
  }, [surveyGroupName, name]);

  return (
    <Row className="main login-container" align="middle" justify="center">
      <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
        <div className="login-header">
          <h1 className="logo">A.</h1>
          <h1>AkvoFlow Forms</h1>
          <h2>{surveyTitle}</h2>
        </div>
        <div className="login-form">
          <h4>Log in to submit data</h4>
          <Form
            name="login"
            layout="vertical"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={(values) => console.log(values)}
          >
            <Form.Item
              label="Submitter"
              name="submitter"
              rules={[{ required: true, message: "Submitter name required." }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label="Password"
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
          <Text>AkvoFlow Webforms enabling remote Byod data collection. </Text>
          <Link>Data policy</Link>.{" "}
          <Link href="https://akvo.org/" target="_blank">
            Akvo.org
          </Link>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
