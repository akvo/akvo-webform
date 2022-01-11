import React, { useState } from "react";
import { Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { FaStarOfLife } from "react-icons/fa";

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
      {show && <p dangerouslySetInnerHTML={{ __html: text }} />}
    </div>
  );
};

const Label = ({ keyform, text, mandatory, help }) => {
  return (
    <div className="field-label">
      <p>
        {keyform + 1}. {text}{" "}
        {mandatory && <FaStarOfLife className="icon required" />}
      </p>
      {help && <Help {...help} />}
    </div>
  );
};

export default Label;
