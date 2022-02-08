import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button, Form, Drawer, Space } from "antd";
import { FiMenu } from "react-icons/fi";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import { saveFormToDB } from "../lib/db";
import generateForm, {
  transformRequest,
  checkFilledForm,
  generateDataPointNameDisplay,
  generateDataPointId,
} from "../lib/form";
import dataProviders from "../store";
import {
  QuestionGroup,
  FormHeader,
  Sidebar,
  NotificationModal,
  MobileFooter,
} from "../components";

const Home = () => {
  const [error, setError] = useState(false);
  const { formId } = useParams();
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { forms, dataPointName, group } = state;
  const { questionGroup } = forms;
  const { active, complete } = group;
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSubmitFailed, setIsSubmitFailed] = useState([]);
  const [notification, setNotification] = useState({ isVisible: false });
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);

  // check screen size
  const isMobile = window.matchMedia(
    "only screen and (max-width: 760px)"
  ).matches;

  const onComplete = (values) => {
    setIsSubmit(true);
    const responses = transformRequest(questionGroup, values);
    const dataPointNameDisplay = generateDataPointNameDisplay(dataPointName);
    const data = {
      dataPointId: forms?.dataPointId,
      deviceId: forms?.deviceId,
      formId: forms?.surveyId,
      formVersion: forms?.version,
      instance: forms?.app,
      submissionStart: forms?.submissionStart,
      submissionStop: Date.now(),
      username: "akvo-webform", // change later
      dataPointName: dataPointNameDisplay || "Untitled",
      responses: responses,
    };
    console.log("Finish", data);
    api
      .post(`/submit-form?`, data, { "content-type": "application/json" })
      .then((res) => {
        console.log(res.data);
        setIsSubmit(false);
        setNotification({
          isVisible: true,
          type: "success",
          onOk: () => window.location.reload(),
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
        setIsSubmit(false);
        setError(e.response);
      });
  };

  const onCompleteFailed = ({ values, errorFields }) => {
    setIsSubmitFailed(errorFields);
    console.log("Failed", transformRequest(questionGroup, values), errorFields);
  };

  const onValuesChange = (qg, value, values) => {
    const errorFields = form.getFieldsError();
    const { filled, completeQg, isDpName } = checkFilledForm(
      errorFields,
      dataPointName,
      qg,
      value,
      values
    );
    dispatch({
      type: "UPDATE ANSWER",
      payload: {
        answer: values,
        group: {
          complete: completeQg.flatMap((qg) => qg.i),
        },
        dataPointName: isDpName && value,
        progress: (filled.length / errorFields.length) * 100,
      },
    });
  };

  useEffect(() => {
    api
      .get(`form/${formId}`)
      .then((res) => {
        let formData = generateForm(res.data);
        // add form metadata
        formData = {
          ...formData,
          dataPointId: generateDataPointId(),
          deviceId: "Akvo Flow Web",
          submissionStart: Date.now(),
        };
        saveFormToDB({ formId: formId, ...formData });
        dispatch({ type: "INIT FORM", payload: formData });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(`${formId}`, status, statusText);
        setError(e.response);
      });
  }, [formId]);

  const sidebarProps = useMemo(() => {
    return {
      active: active,
      complete: complete,
      questionGroup: questionGroup,
      isSubmitFailed: isSubmitFailed,
    };
  }, [active, complete, questionGroup, isSubmitFailed]);

  if (error) {
    return (
      <ErrorPage
        status={error.status}
        title={error?.statusText || "Error Loading Form"}
        messages={[error?.statusText || `Form Id ${formId} is not found`]}
      />
    );
  }

  if (!forms) {
    console.log("Loading");
  }

  const lastGroup = active + 1 === questionGroup.length;

  return (
    <Row className="container">
      <FormHeader
        submit={() => form.submit()}
        isSubmit={isSubmit}
        isMobile={isMobile}
      />
      {!isMobile && (
        <Col span={6} className="sidebar sticky">
          <Sidebar {...sidebarProps} />
        </Col>
      )}
      <Col span={isMobile ? 24 : 18} className="main">
        <Form
          form={form}
          layout="vertical"
          name={forms.name}
          scrollToFirstError="true"
          onValuesChange={(value, values) =>
            setTimeout(() => {
              onValuesChange(questionGroup, value, values);
            }, 100)
          }
          onFinish={onComplete}
          onFinishFailed={onCompleteFailed}
        >
          {questionGroup.map((group, key) => {
            return (
              <QuestionGroup
                key={key}
                form={form}
                active={active}
                group={group}
              />
            );
          })}
        </Form>
        {!isMobile && !lastGroup && (
          <Col span={24} className="next">
            <Button
              className="button-next"
              size="large"
              type="default"
              onClick={() => {
                if (!lastGroup) {
                  dispatch({
                    type: "UPDATE GROUP",
                    payload: { active: active + 1 },
                  });
                }
              }}
            >
              Next
            </Button>
          </Col>
        )}
      </Col>
      {/* Mobile Footer */}
      {isMobile && (
        <MobileFooter
          isMobile={isMobile}
          isSubmit={isSubmit}
          isMobileMenuVisible={isMobileMenuVisible}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
          sidebarProps={sidebarProps}
          lastGroup={lastGroup}
          form={form}
        />
        // <Col span={24} className="mobile-footer-container">
        //   <Row justify="space-between" align="middle">
        //     <Col span={12} align="start">
        //       <Space size={5}>
        //         <Button
        //           type="link"
        //           icon={<FiMenu className="icon" />}
        //           onClick={() => setIsMobileMenuVisible(!isMobileMenuVisible)}
        //         />
        //         <div>
        //           {sidebarProps?.active + 1} /{" "}
        //           {sidebarProps?.questionGroup?.length}
        //         </div>
        //       </Space>
        //     </Col>
        //     <Col span={12} align="end">
        //       <Button
        //         className="button-next"
        //         size="large"
        //         type="default"
        //         onClick={() => {
        //           setIsMobileMenuVisible(false);
        //           if (!lastGroup) {
        //             dispatch({
        //               type: "UPDATE GROUP",
        //               payload: { active: active + 1 },
        //             });
        //           } else {
        //             form.submit();
        //           }
        //         }}
        //         loading={lastGroup && isSubmit}
        //         disabled={lastGroup && isSubmit}
        //       >
        //         {!lastGroup ? "Next" : "Submit"}
        //       </Button>
        //     </Col>
        //   </Row>
        //   {/* Drawer menu */}
        //   <Drawer
        //     title={null}
        //     placement="bottom"
        //     closable={false}
        //     onClose={() => setIsMobileMenuVisible(false)}
        //     visible={isMobileMenuVisible}
        //     className="sidebar mobile"
        //     height="100%"
        //     zIndex="1001"
        //   >
        //     <Sidebar
        //       {...sidebarProps}
        //       isMobile={isMobile}
        //       setIsMobileMenuVisible={setIsMobileMenuVisible}
        //     />
        //   </Drawer>
        // </Col>
      )}
      {/* Notification Modal */}
      <NotificationModal {...notification} />
    </Row>
  );
};

export default Home;
