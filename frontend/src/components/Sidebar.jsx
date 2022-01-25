import React from "react";
import { List, Space } from "antd";
import {
  MdRadioButtonUnchecked,
  MdRadioButtonChecked,
  MdCheckCircle,
  MdRepeat,
} from "react-icons/md";
import dataProviders from "../store";

const Sidebar = ({ active, complete, questionGroup, isSubmitted }) => {
  return (
    <List
      bordered={false}
      header={<div className="sidebar-header">form overview</div>}
      dataSource={questionGroup}
      renderItem={(item, key) => (
        <ListItem
          index={key}
          item={item}
          active={active}
          complete={complete}
          isSubmitted={isSubmitted}
        />
      )}
    />
  );
};

const ListItem = ({ index, item, active, complete, isSubmitted }) => {
  const dispatch = dataProviders.Actions();
  const checkComplete = item?.repeatable ? `${index}-${item?.repeat}` : index;

  return (
    <List.Item
      key={index}
      onClick={() =>
        dispatch({ type: "UPDATE GROUP", payload: { active: index } })
      }
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
        </div>
        {!complete.includes(checkComplete) && isSubmitted.length ? (
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
