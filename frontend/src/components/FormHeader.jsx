import React, { useMemo } from "react";
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

const LangDropdown = () => {
  const { language } = dataProviders.Values();
  const dispatch = dataProviders.Actions();
  return (
    <Menu
      selectedKeys={[language?.active]}
      onClick={({ key }) => dispatch({ type: "UPDATE LANGUAGE", payload: key })}
      className="menu-dropdown"
    >
      {language?.list?.map((lang) => (
        <Menu.Item key={lang?.language}>{lang?.name}</Menu.Item>
      ))}
    </Menu>
  );
};

const DatapointDisplayName = ({ dataPointNameDisplay }) => {
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
  const { dataPointName, forms, language } = dataProviders.Values();
  const dataPointNameDisplay = generateDataPointNameDisplay(
    dataPointName,
    form
  );
  const isDisplayNameShown = dataPointNameDisplay.length > 0;

  const renderActiveLang = useMemo(() => {
    const { defaultLang, active } = language;
    if (defaultLang === active) {
      return active;
    }
    return `${defaultLang} / ${active}`;
  }, [language]);

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
        <Col xs={12} sm={18} md={6} className="right">
          <h1 className="logo">A.</h1>
          <h1>{forms.name}</h1>
        </Col>
        <Col xs={12} sm={6} md={18} className="left">
          {!isMobile && (
            <DatapointDisplayName dataPointNameDisplay={dataPointNameDisplay} />
          )}
          <Dropdown overlay={<LangDropdown />} placement="bottomCenter">
            <Button size={isMobile ? "middle" : "large"} className="lang">
              {renderActiveLang}
            </Button>
          </Dropdown>
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
            <DatapointDisplayName dataPointNameDisplay={dataPointNameDisplay} />
          </Col>
        )}
      </Row>
    </Col>
  );
};
export default React.memo(FormHeader);
