import React from "react";
import { Row, Col, Button, Drawer, Space } from "antd";
import { FiMenu } from "react-icons/fi";
import dataProviders from "../store";
import { Sidebar } from ".";

const MobileFooter = ({
  isMobile,
  isSubmit,
  isMobileMenuVisible,
  setIsMobileMenuVisible,
  sidebarProps,
  lastGroup,
  form,
}) => {
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { group } = state;
  const { active } = group;

  return (
    <Col span={24} className="mobile-footer-container">
      <Row justify="space-between" align="middle">
        <Col span={12} align="start">
          <Space size={5}>
            <Button
              type="link"
              icon={<FiMenu className="icon" />}
              onClick={() => setIsMobileMenuVisible(!isMobileMenuVisible)}
            />
            <div>
              {sidebarProps?.active + 1} / {sidebarProps?.questionGroup?.length}
            </div>
          </Space>
        </Col>
        <Col span={12} align="end">
          <Button
            className="button-next"
            size="large"
            type="default"
            onClick={() => {
              setIsMobileMenuVisible(false);
              if (!lastGroup) {
                dispatch({
                  type: "UPDATE GROUP",
                  payload: { active: active + 1 },
                });
              } else {
                form.submit();
              }
            }}
            loading={lastGroup && isSubmit}
            disabled={lastGroup && isSubmit}
          >
            {!lastGroup ? "Next" : "Submit"}
          </Button>
        </Col>
      </Row>
      {/* Drawer menu */}
      <Drawer
        title={null}
        placement="bottom"
        closable={false}
        onClose={() => setIsMobileMenuVisible(false)}
        visible={isMobileMenuVisible}
        className="sidebar mobile"
        height="100%"
        zIndex="1001"
      >
        <Sidebar
          {...sidebarProps}
          isMobile={isMobile}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
        />
      </Drawer>
    </Col>
  );
};

export default MobileFooter;
