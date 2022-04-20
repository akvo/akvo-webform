import React, { useState } from "react";
import { Tabs, Card, Tag, Alert } from "antd";
import { WarningOutlined } from "@ant-design/icons";
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
        <Alert
          showIcon={true}
          icon={<WarningOutlined />}
          message={<b>Limitations</b>}
          description={
            <ol className="info-banner">
              <li>Repeat groups are currently not supported.</li>
              <li>
                PowerBI imposes timeouts for Get Data requests. This may happen
                while loading data from surveys with very high number of
                submissions.
              </li>
            </ol>
          }
          type="error"
        />
      </TabPane>
    </Tabs>
  );
};

export default FormInfo;
