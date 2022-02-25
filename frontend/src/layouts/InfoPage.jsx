import React from "react";
import { Row, Col, Typography, Result } from "antd";
import { FormOutlined } from "@ant-design/icons";

const { Link } = Typography;

const InfoPage = () => {
  return (
    <div className="main login-container info-page-container">
      {/* <Row
        align="middle"
        justify="center"
        className="login-header-wrapper info-page-header-wrapper"
      >
        <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
          <div className="login-header info-page-header">
            <h1 className="logo">
              <img src="/favicon-96x96.png" alt="akvoflow-webforms-logo" />
            </h1>
            <h1>AkvoFlow WebForms</h1>
          </div>
        </Col>
      </Row> */}
      <Row align="middle" justify="center">
        <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
          <div className="info-page-body">
            <Result
              status="success"
              icon={<FormOutlined />}
              title="Thank you for your submission!"
              className="info-page-content"
            />
          </div>
          <div className="login-footer info-page-footer">
            <Link href="https://akvo.org/" target="_blank">
              Akvo.org
            </Link>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default InfoPage;
