import React from "react";
import { Row, Col, Button, Dropdown, Menu, message } from "antd";
import { FiMoreHorizontal, FiMoreVertical } from "react-icons/fi";
import { BiBarcodeReader } from "react-icons/bi";
import dataProviders from "../store";
import { generateDataPointNameDisplay } from "../lib/form";

const onClick = ({ key }) => {
  message.info(`Click on item ${key}`);
};

const menu = (
  <Menu onClick={onClick} className="menu-dropdown">
    <Menu.Item key="print">Print form</Menu.Item>
    <Menu.Item key="print-prefilled">Print prefilled form</Menu.Item>
    <Menu.Item key="reset">Clear all responses</Menu.Item>
  </Menu>
);

const DatapointDisplayName = ({ dataPointName, form }) => {
  dataPointName = dataPointName.map((x) => {
    let findValue = form.getFieldValue(x?.id);
    if (Array.isArray(findValue)) {
      findValue = findValue?.map((x) => x?.name || x)?.join(" - ");
    }
    return {
      ...x,
      value: x?.value || findValue || false,
    };
  });
  const dataPointNameDisplay = generateDataPointNameDisplay(dataPointName);
  return (
    <div className="datapoint">
      {dataPointNameDisplay.length ? <BiBarcodeReader className="icon" /> : ""}
      {dataPointNameDisplay}
    </div>
  );
};

const FormHeader = ({ submit, isSubmit, isMobile, form, onSave, isSave }) => {
  const { dataPointName, forms } = dataProviders.Values();
  const isDisplayNameShown = dataPointName.filter((x) => x.value)?.length > 0;

  return (
    <Col
      span={24}
      className={`form-header sticky ${
        isMobile && isDisplayNameShown ? "mobile-header-with-display-name" : ""
      }`}
    >
      <Row
        align="middle"
        className="form-header-container"
        justify="space-around"
      >
        <Col span={12} className="right">
          <h1 className="logo">A.</h1>
          <h1>{forms.name}</h1>
        </Col>
        <Col span={12} className="left">
          {!isMobile && (
            <DatapointDisplayName dataPointName={dataPointName} form={form} />
          )}
          <Button
            size={isMobile ? "middle" : "large"}
            className="lang"
            onClick={() => onClick("Change Language")}
          >
            En
          </Button>
          {!isMobile && (
            <>
              <Button
                size="large"
                className="submit"
                htmlType="submit"
                onClick={() => submit()}
                loading={isSubmit}
                disabled={isSubmit || isSave}
              >
                Submit
              </Button>
              <Button
                size="large"
                className="submit"
                onClick={onSave}
                loading={isSave}
                disabled={isSave || isSubmit}
              >
                Save
              </Button>
            </>
          )}
          <Dropdown overlay={menu} placement="bottomCenter">
            {isMobile ? (
              <FiMoreVertical className="more" />
            ) : (
              <FiMoreHorizontal className="more" />
            )}
          </Dropdown>
        </Col>
        {isMobile && isDisplayNameShown && (
          <Col span={24}>
            <DatapointDisplayName dataPointName={dataPointName} form={form} />
          </Col>
        )}
      </Row>
    </Col>
  );
};
export default React.memo(FormHeader);
