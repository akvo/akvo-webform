import React, { useState } from "react";
import { Row, Col, Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const Help = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <Row className="help">
      <Col>
        <Button
          onClick={() => setShow(show ? false : true)}
          icon={<InfoCircleOutlined />}
          size="small"
        >
          more info
        </Button>
        {show && <p>{text}</p>}
      </Col>
    </Row>
  );
};

export default Help;
