import React, { useMemo } from "react";
import { List, Space, Button } from "antd";
import {
  MdRadioButtonUnchecked,
  MdRadioButtonChecked,
  MdCheckCircle,
  MdRepeat,
} from "react-icons/md";
import { AiOutlineDown } from "react-icons/ai";
import dataProviders from "../store";

const Sidebar = ({
  active,
  questionGroup,
  groupStatuses,
  isMobile,
  setIsMobileMenuVisible,
}) => {
  return (
    <List
      bordered={false}
      header={
        <div className="sidebar-header">
          {isMobile && (
            <Button
              type="link"
              icon={
                <AiOutlineDown
                  className="icon"
                  onClick={() => isMobile && setIsMobileMenuVisible(false)}
                />
              }
            />
          )}{" "}
          form overview
        </div>
      }
      dataSource={questionGroup}
      renderItem={(item) => (
        <ListItem
          item={item}
          active={active}
          status={groupStatuses.find((x) => x.index === item?.index)?.status}
          isMobile={isMobile}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
        />
      )}
    />
  );
};

const ListItem = ({
  item,
  active,
  status,
  isMobile,
  setIsMobileMenuVisible,
}) => {
  const dispatch = dataProviders.Actions();
  const { language } = dataProviders.Values();
  const activeLang = language?.active;

  const langText = useMemo(() => {
    const findLang = item?.altText?.find((x) => x?.language === activeLang);
    return findLang?.text ? (
      <div className="translation-text sidebar-list-item">{findLang.text}</div>
    ) : null;
  }, [item, activeLang]);

  return (
    <List.Item
      onClick={() => {
        isMobile && setIsMobileMenuVisible(false);
        dispatch({ type: "UPDATE GROUP", payload: { active: item.index } });
      }}
      className={`sidebar-list ${active === item.index ? "active" : ""} ${
        status === "complete" ? "complete" : ""
      }`}
    >
      <Space direction="vertical">
        <div>
          {status === "complete" ? (
            <MdCheckCircle className="icon" />
          ) : active === item.index ? (
            <MdRadioButtonChecked className="icon" />
          ) : (
            <MdRadioButtonUnchecked className="icon" />
          )}
          {item?.heading}
          {item?.repeatable ? <MdRepeat className="icon icon-right" /> : ""}
          {langText}
        </div>
        {status === "error" ? (
          <div className="sidebar-incomplete-text">
            Please fill in all required questions
          </div>
        ) : null}
      </Space>
    </List.Item>
  );
};

export default Sidebar;
