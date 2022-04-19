import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Form, Input, Button, Select, Space, Modal } from "antd";
import dataProviders from "../store";
import api from "../lib/api";
import {
  OrderedListOutlined,
  FolderFilled,
  BookFilled,
} from "@ant-design/icons";
import { FormInfo } from "../components";
import { take } from "lodash";
const { Option } = Select;

const OauthLogin = () => {
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { auth } = state;
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [dropdownList, setDropdownList] = useState([]);
  const [instanceName, setInstanceName] = useState(null);
  const [formDetail, setFormDetail] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("username", values.email);
    formData.append("password", values.password);
    api.post("/login", formData).then((res) => {
      api.setToken(res.data.refresh_token);
      setLoading(false);
      dispatch({
        type: "LOGIN",
        payload: { isLogin: true, submitter: values.email },
      });
    });
  };

  const searchForm = (values) => {
    setLoading(true);
    setLoadingIndex(0);
    setDropdownList([]);
    setFormDetail(false);
    setInstanceName(values.instance);
    setDropdownList([[]]);
    api.get(`/flow-data/folders/${values.instance}`).then((res) => {
      const { surveys, folders } = res.data;
      setDropdownList([[...folders, ...surveys]]);
      setLoading(false);
      setLoadingIndex(null);
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const changeDropdown = (data, index) => {
    const [id, type, name, surveyId] = data.split("-");
    console.log(surveyId);
    setFormDetail(false);
    if (type !== "form") {
      const url = `${type}s/${instanceName}?id=${id}`;
      const currentDropdown = take(dropdownList, index + 1);
      setLoadingIndex(index);
      setDropdownList(currentDropdown);
      api
        .get(`/flow-data/${url}`)
        .then((res) => {
          if (type === "folder") {
            const { surveys, folders } = res.data;
            const newDropdown = [...folders, ...surveys];
            setDropdownList([...currentDropdown, newDropdown]);
          }
          if (type === "survey") {
            setDropdownList([...currentDropdown, res.data]);
          }
          setLoadingIndex(null);
        })
        .catch((err) => {
          setDropdownList([...currentDropdown, []]);
          setLoadingIndex(null);
        });
    } else {
      setFormDetail({
        id: id,
        name: name,
        surveyId: surveyId,
        instance: instanceName,
      });
      api.get(`/generate/${instanceName}/${id}`).then((res) => {
        setFormDetail({
          id: id,
          name: name,
          surveyId: surveyId,
          instance: instanceName,
          formUrl: `/${res.data}`,
        });
      });
    }
  };

  return (
    <div className="main login-container">
      <Row align="middle" justify="center" className="login-header-wrapper">
        <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
          <div className="login-header">
            <h1 className="logo">
              <img src="/favicon-96x96.png" alt="akvoflow-webforms-logo" />
            </h1>
            <h1>AkvoFlow Webform</h1>
          </div>
        </Col>
      </Row>
      <Row align="middle" justify="center">
        <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
          <div className="login-form">
            <Form
              name="login"
              layout="vertical"
              onFinish={auth.isLogin ? searchForm : onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              {!auth.isLogin && (
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                  ]}
                >
                  <Input />
                </Form.Item>
              )}

              {!auth.isLogin && (
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
              )}
              {auth.isLogin && (
                <Form.Item
                  label="Instance Name"
                  name="instance"
                  rules={[
                    { required: true, message: "Please input instance name!" },
                  ]}
                >
                  <Input addonAfter={".akvoflow.org"} />
                </Form.Item>
              )}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="button-next"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  {auth.isLogin ? "Search Instance" : "Login"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
      {dropdownList.map((d, di) => (
        <Row
          key={di}
          align="middle"
          justify="center"
          style={{ marginBottom: "20px" }}
        >
          <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
            <Select
              showSearch
              style={{ width: "100%" }}
              placeholder="Search to Select"
              onChange={(data) => changeDropdown(data, di)}
              loading={loadingIndex === di}
              filterOption={(input, option) =>
                option.props.value.toLowerCase().indexOf(input.toLowerCase()) >=
                0
              }
            >
              {d.map((o) => (
                <Option
                  key={o.id}
                  value={`${o.id}-${o.type}-${o.name}-${o?.surveyId}`}
                >
                  <Space>
                    {o.type === "folder" ? (
                      <FolderFilled />
                    ) : o.type === "survey" ? (
                      <BookFilled />
                    ) : (
                      <OrderedListOutlined />
                    )}
                    {o.name || "New Survey"}
                    {!!o?.version ? `v${o.version}` : ""}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      ))}
      {formDetail && (
        <Row align="middle" justify="center">
          <Col xs={20} sm={16} md={12} lg={10} xl={8} xxl={6}>
            <Button
              type="primary"
              className="button-secondary"
              size="large"
              onClick={() => setModalVisible(true)}
              style={{ marginBottom: "20px" }}
              block
            >
              Show Form Detail
            </Button>
            {formDetail?.formUrl && (
              <Link to={formDetail.formUrl}>
                <Button
                  type="primary"
                  className="button-next"
                  size="large"
                  block
                >
                  Go To Form
                </Button>
              </Link>
            )}
          </Col>
        </Row>
      )}
      {formDetail && (
        <Modal
          title={<div>Form: {formDetail?.name}</div>}
          centered
          visible={modalVisible}
          maskClosable
          closable
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={640}
        >
          <FormInfo formDetail={formDetail} />
        </Modal>
      )}
    </div>
  );
};

export default OauthLogin;
