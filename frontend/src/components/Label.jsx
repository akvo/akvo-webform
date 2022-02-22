import React, { useState, useMemo } from "react";
import { Button, Space } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { FaStarOfLife } from "react-icons/fa";
import dataProviders from "../store";

const Help = ({ activeLang, text, altText }) => {
  const [show, setShow] = useState(false);
  const findLang = altText?.find((x) => x?.language === activeLang);

  return (
    <div className="help">
      <Button
        onClick={() => setShow(show ? false : true)}
        icon={<InfoCircleOutlined />}
        size="small"
      >
        more info
      </Button>
      {show && (
        <p dangerouslySetInnerHTML={{ __html: findLang?.text || text }} />
      )}
    </div>
  );
};

const Label = ({
  keyform,
  text,
  mandatory,
  help,
  requireDoubleEntry,
  altText,
}) => {
  const { language } = dataProviders.Values();
  const activeLang = language?.active;

  const langText = useMemo(() => {
    const findLang = altText?.find((x) => x?.language === activeLang);
    return findLang?.text ? <div>{findLang?.text}</div> : "";
  }, [altText, activeLang]);

  return (
    <div className="field-label">
      <Space direction="vertical">
        <div>
          {keyform + 1}. {text}
          {mandatory && <FaStarOfLife className="icon required" />}
          {requireDoubleEntry && (
            <i className="double-entry-text">Require Double Entry</i>
          )}
        </div>
        {langText}
        {help && help?.text && help?.text !== "" && (
          <Help activeLang={activeLang} {...help} />
        )}
      </Space>
    </div>
  );
};

export default React.memo(Label);
