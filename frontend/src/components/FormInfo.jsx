import React, { useState } from "react";
import { Tabs, Card, Tag } from "antd";
import api from "../lib/api";

const { TabPane } = Tabs;

const FormInfo = ({ formDetail }) => {
  const { id, instance, surveyId } = formDetail;
  const [showToken, setShowToken] = useState(false);
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Integration" key="1">
        <h2>Power BI</h2>
        <ol className="info">
          <li>
            To import Akvo Flow Data into Power BI via REST API calls, open the
            Power BI Dashboard and click <b>Get Data {">"} Web</b>
          </li>
          <li>
            A new window will appear. There, you configure the task. Click
            Advanced to select the right working mode. In URL parts, insert the
            following URL:
            <pre>
              {window.origin}/api/flow-data/{instance}?survey_id={surveyId}
              &form_id={id}
            </pre>
          </li>
          <li>
            Provide authentication details to make a Rest API call via Power BI
            by filling <b>HTTP request header parameters</b> fields.
            <br />
            Header name: <b>token</b> <br />
            Value:{" "}
            <Tag
              onClick={() => setShowToken(!showToken)}
              style={{ cursor: "pointer" }}
            >
              {showToken ? "hide" : "click to show"}
            </Tag>
            <pre>{showToken ? api?.token : "****************"}</pre>
          </li>
          <li>Click Connect to import the data.</li>
        </ol>
      </TabPane>
      <TabPane tab="Download" key="2">
        Content of Tab Pane 2
      </TabPane>
    </Tabs>
  );
};

export default FormInfo;
