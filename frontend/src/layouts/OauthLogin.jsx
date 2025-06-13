import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Select,
  Space,
  Modal,
  notification,
  Checkbox,
  Radio,
} from "antd";
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
  const [printLoading, setPrintLoading] = useState(false);
  const [printSettingsVisible, setPrintSettingsVisible] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    sectionNumbering: false,
    questionNumbering: false,
    orientation: "landscape",
    outputFormat: "pdf",
  });

  const handlePrint = async (formUrl) => {
    try {
      setPrintLoading(true);
      notification.info({
        message: "Preparing Form",
        description: "Generating printable version of the form...",
        duration: 2,
      });

      // Remove the leading slash from formUrl
      const formId = formUrl.replace("/", "");

      let responseType = "text";
      if (printSettings.outputFormat === "docx") {
        responseType = "blob";
      }
      const response = await api.get(
        `/form/${formId}/print?section_numbering=${printSettings.sectionNumbering}&question_numbering=${printSettings.questionNumbering}&orientation=${printSettings.orientation}&output_format=${printSettings.outputFormat}`,
        {},
        {
          responseType: responseType,
        }
      );

      // if output format is docx, the backend should return file and FE should download it
      if (printSettings.outputFormat === "docx") {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `form-${formId}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      if (printSettings.outputFormat === "pdf") {
        // Create a hidden iframe to preload content
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        // Write content to iframe and wait for resources to load
        iframe.contentDocument.write(response.data);
        iframe.contentDocument.close();

        // Wait for all resources to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Fallback if onload doesn't trigger
          setTimeout(resolve, 1000);
        });

        notification.success({
          message: "Form Ready",
          description: "Opening print dialog...",
          duration: 2,
        });

        // Create the actual print window with loaded content
        const printWindow = window.open("", "_blank");
        printWindow.document.write(response.data);
        printWindow.document.close();

        // Add print styles for smooth transition
        const style = printWindow.document.createElement("style");
        style.textContent = `
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `;
        printWindow.document.head.appendChild(style);

        // Wait a bit for the window to fully render
        setTimeout(() => {
          printWindow.print();

          // Monitor print dialog
          const checkPrintDialogClosed = setInterval(() => {
            if (printWindow.document.readyState === "complete") {
              clearInterval(checkPrintDialogClosed);
              // Give user time to see the content before closing
              setTimeout(() => {
                printWindow.close();
                // Clean up the preload iframe
                document.body.removeChild(iframe);
              }, 500);
            }
          }, 1000);
        }, 500);
      }
    } catch (error) {
      notification.error({
        message: "Print Failed",
        description:
          error.response?.data?.detail ||
          "Failed to generate print view. Please try again.",
        duration: 4,
      });
    } finally {
      setPrintLoading(false);
      setPrintSettingsVisible(false);
    }
  };

  const onFinish = (values) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("username", values.email);
    formData.append("password", values.password);
    api
      .post("/login", formData)
      .then((res) => {
        api.setToken(res.data.refresh_token);
        dispatch({
          type: "LOGIN",
          payload: { isLogin: true, submitter: values.email },
        });
      })
      .catch(() => {
        notification.error({
          message: "Authentication failed",
          description:
            "The Email and/or Password that you have entered is incorrect",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const searchForm = (values) => {
    setLoading(true);
    setLoadingIndex(0);
    setDropdownList([]);
    setFormDetail(false);
    setInstanceName(values.instance);
    setDropdownList([]);
    api
      .get(`/flow-data/folders/${values.instance}`)
      .then((res) => {
        const { surveys, folders } = res.data;
        setDropdownList([[...folders, ...surveys]]);
      })
      .catch((e) => {
        const message =
          e.response.status === 404 ? (
            <div>
              <b>{values.instance}.akvoflow.org</b> is not found
            </div>
          ) : (
            <div>
              You don&apos;t have permission to access
              <b>{values.instance}.akvoflow.org</b>
            </div>
          );
        notification.error({
          message: "Failed",
          description: message,
        });
      })
      .finally(() => {
        setLoading(false);
        setLoadingIndex(null);
      });
  };

  const changeDropdown = (data, index) => {
    const [id, type, name, surveyId] = data.split("-");
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
        .catch(() => {
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
                    {o?.version ? `v${o.version}` : ""}
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
              <>
                <Link to={formDetail.formUrl}>
                  <Button
                    type="primary"
                    className="button-next"
                    size="large"
                    style={{ marginBottom: "20px" }}
                    block
                  >
                    Go To Form
                  </Button>
                </Link>
                <div>
                  <Button
                    type="primary"
                    className="button-next"
                    size="large"
                    block
                    loading={printLoading}
                    onClick={() => setPrintSettingsVisible(true)}
                  >
                    Print Form
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      )}

      {/* Print Settings Modal */}
      <Modal
        title="Print Settings"
        visible={printSettingsVisible}
        onOk={() => handlePrint(formDetail.formUrl)}
        onCancel={() => setPrintSettingsVisible(false)}
        okText="Print"
        confirmLoading={printLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <div style={{ marginBottom: "8px" }}>Output Format</div>
            <Radio.Group
              value={printSettings.outputFormat}
              onChange={(e) =>
                setPrintSettings({
                  ...printSettings,
                  outputFormat: e.target.value,
                })
              }
            >
              <Radio.Button value="pdf">PDF</Radio.Button>
              <Radio.Button value="docx">DOCX</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <div style={{ marginBottom: "8px" }}>Page Orientation</div>
            <Radio.Group
              value={printSettings.orientation}
              onChange={(e) =>
                setPrintSettings({
                  ...printSettings,
                  orientation: e.target.value,
                })
              }
            >
              <Radio.Button value="portrait">Portrait</Radio.Button>
              <Radio.Button value="landscape">Landscape</Radio.Button>
            </Radio.Group>
          </div>
          <Checkbox
            checked={printSettings.sectionNumbering}
            onChange={(e) =>
              setPrintSettings({
                ...printSettings,
                sectionNumbering: e.target.checked,
              })
            }
          >
            Add section numbering
          </Checkbox>
          <Checkbox
            checked={printSettings.questionNumbering}
            onChange={(e) =>
              setPrintSettings({
                ...printSettings,
                questionNumbering: e.target.checked,
              })
            }
          >
            Add question numbering
          </Checkbox>
        </Space>
      </Modal>

      {/* Form Detail Modal */}
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
