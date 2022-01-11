import React, { useState } from "react";
import { Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const Help = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="help">
      <Button
        onClick={() => setShow(show ? false : true)}
        icon={<InfoCircleOutlined />}
        size="small"
      >
        more info
      </Button>
      {show && <p>{text}</p>}
    </div>
  );
};

const Label = ({ keyform, text, help }) => {
  return (
    <div className="field-label">
      <p>
        {keyform + 1}. {text}
      </p>
      {help && <Help {...help} />}
    </div>
  );
};

export default Label;
