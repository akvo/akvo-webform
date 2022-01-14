import React from "react";
import { List } from "antd";
import {
  MdRadioButtonUnchecked,
  MdRadioButtonChecked,
  MdCheckCircle,
  MdRepeat,
} from "react-icons/md";
import dataProviders from "../store";

const Sidebar = ({ active, complete, questionGroup }) => {
  const dispatch = dataProviders.Actions();

  return (
    <List
      bordered={false}
      header={<div className="sidebar-header">form overview</div>}
      dataSource={questionGroup}
      renderItem={(item, key) => (
        <List.Item
          key={key}
          onClick={() =>
            dispatch({ type: "UPDATE GROUP", payload: { active: key } })
          }
          className={`sidebar-list ${active === key ? "active" : ""} ${
            complete.includes(key) ? "complete" : ""
          }`}
        >
          {complete.includes(key) ? (
            <MdCheckCircle className="icon" />
          ) : active === key ? (
            <MdRadioButtonChecked className="icon" />
          ) : (
            <MdRadioButtonUnchecked className="icon" />
          )}
          {item?.heading}
          {item?.repeatable ? <MdRepeat className="icon icon-right" /> : ""}
        </List.Item>
      )}
    />
  );
};

export default Sidebar;
