import React from "react";
import { Result, Typography } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

const { Paragraph, Text } = Typography;

const ErrorPage = ({ status, title, messages }) => {
  return (
    <Result status="error" title={`${status} - ${title}`}>
      <div className="desc">
        <Paragraph>
          <Text
            strong
            style={{
              fontSize: 16,
            }}
          >
            The page has the following error:
          </Text>
        </Paragraph>
        {messages.map((message, messageIndex) => {
          return (
            <Paragraph key={messageIndex}>
              <CloseCircleOutlined className="site-result-error-icon" />{" "}
              {message}
            </Paragraph>
          );
        })}
      </div>
    </Result>
  );
};

export default ErrorPage;
