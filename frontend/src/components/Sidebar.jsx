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
  complete,
  questionGroup,
  isSubmitFailed,
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
      renderItem={(item, key) => (
        <ListItem
          index={key}
          item={item}
          active={active}
          complete={complete}
          isSubmitFailed={isSubmitFailed}
          isMobile={isMobile}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
        />
      )}
    />
  );
};

const ListItem = ({
  index,
  item,
  active,
  complete,
  isSubmitFailed,
  isMobile,
  setIsMobileMenuVisible,
}) => {
  const dispatch = dataProviders.Actions();
  const { language } = dataProviders.Values();
  const checkComplete = item?.repeatable ? `${index}-${item?.repeat}` : index;
  const activeLang = language?.active;

  const langText = useMemo(() => {
    const findLang = item?.altText?.find((x) => x?.language === activeLang);
    return findLang?.text ? (
      <div className="translation-text sidebar-list-item">{findLang.text}</div>
    ) : (
      ""
    );
  }, [item, activeLang]);

  return (
    <List.Item
      key={index}
      onClick={() => {
        isMobile && setIsMobileMenuVisible(false);
        dispatch({ type: "UPDATE GROUP", payload: { active: index } });
      }}
      className={`sidebar-list ${active === index ? "active" : ""} ${
        complete.includes(checkComplete) ? "complete" : ""
      }`}
    >
      <Space direction="vertical">
        <div>
          {complete.includes(checkComplete) ? (
            <MdCheckCircle className="icon" />
          ) : active === index ? (
            <MdRadioButtonChecked className="icon" />
          ) : (
            <MdRadioButtonUnchecked className="icon" />
          )}
          {item?.heading}
          {item?.repeatable ? <MdRepeat className="icon icon-right" /> : ""}
          {langText}
        </div>
        {!complete.includes(checkComplete) && isSubmitFailed.length ? (
          <div className="sidebar-incomplete-text">
            Please fill in all required questions
          </div>
        ) : (
          ""
        )}
      </Space>
    </List.Item>
  );
};

export default Sidebar;
