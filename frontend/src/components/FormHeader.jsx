import React from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button, Dropdown, Menu, message } from "antd";
import { FiMoreHorizontal, FiMoreVertical } from "react-icons/fi";
import { BiBarcodeReader } from "react-icons/bi";
import dataProviders from "../store";
import { generateDataPointNameDisplay } from "../lib/form";
import { deleteAnswerByIdFromDB } from "../lib/db";

const onClick = (key, form, setNotification, forms, dispatch, cacheIdURL) => {
  const clearForm = () => {
    form.resetFields();
    window.location.reload();
    setNotification({ isVisible: false });
  };

  if (key === "reset") {
    setNotification({
      isVisible: true,
      type: "clear",
      onCancel: () => setNotification({ isVisible: false }),
      onOk: () => {
        if (cacheIdURL) {
          // delete cache data from indexedDB
          deleteAnswerByIdFromDB(cacheIdURL).then(() => clearForm());
        } else {
          clearForm();
        }
      },
    });
  } else {
    message.info(`Click on item ${key}`);
  }
};

const MenuDropdown = ({ form, setNotification }) => {
  const cacheIdURL = useParams()?.cacheId;
  const dispatch = dataProviders.Actions();
  const { forms } = dataProviders.Values();

  return (
    <Menu
      onClick={({ key }) =>
        onClick(key, form, setNotification, forms, dispatch, cacheIdURL)
      }
      className="menu-dropdown"
    >
      <Menu.Item key="print">Print form</Menu.Item>
      <Menu.Item key="print-prefilled">Print prefilled form</Menu.Item>
      <Menu.Item key="reset">Clear all responses</Menu.Item>
    </Menu>
  );
};

const DatapointDisplayName = ({ dataPointName }) => {
  const dataPointNameDisplay = generateDataPointNameDisplay(dataPointName);
  return (
    <div className="datapoint">
      {dataPointNameDisplay.length ? <BiBarcodeReader className="icon" /> : ""}
      {dataPointNameDisplay}
    </div>
  );
};

const FormHeader = ({
  submit,
  isSubmit,
  isMobile,
  form,
  onSave,
  isSave,
  isSaveFeatureEnabled,
  setNotification,
}) => {
  const { dataPointName, forms } = dataProviders.Values();
  const newDataPointName = dataPointName.map((x) => {
    let findValue = form.getFieldValue(x?.id);
    if (Array.isArray(findValue)) {
      findValue = findValue?.map((x) => x?.name || x)?.join(" - ");
    }
    return {
      ...x,
      value: x?.value || findValue || false,
    };
  });
  const isDisplayNameShown =
    newDataPointName.filter((x) => x.value)?.length > 0;

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
        <Col xs={12} sm={18} md={6} lg={12} className="right">
          <h1 className="logo">A.</h1>
          <h1>{forms.name}</h1>
        </Col>
        <Col xs={12} sm={6} md={18} lg={12} className="left">
          {!isMobile && (
            <DatapointDisplayName dataPointName={newDataPointName} />
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
              {isSaveFeatureEnabled && (
                <Button
                  size="large"
                  className="submit"
                  onClick={onSave}
                  loading={isSave}
                  disabled={isSave || isSubmit}
                >
                  Save
                </Button>
              )}
            </>
          )}
          <Dropdown
            overlay={
              <MenuDropdown form={form} setNotification={setNotification} />
            }
            placement="bottomCenter"
          >
            {isMobile ? (
              <FiMoreVertical className="more" />
            ) : (
              <FiMoreHorizontal className="more" />
            )}
          </Dropdown>
        </Col>
        {isMobile && isDisplayNameShown && (
          <Col span={24}>
            <DatapointDisplayName dataPointName={newDataPointName} />
          </Col>
        )}
      </Row>
    </Col>
  );
};
export default React.memo(FormHeader);
