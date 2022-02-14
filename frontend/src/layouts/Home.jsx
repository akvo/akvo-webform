import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button, Form } from "antd";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import {
  checkDB,
  saveFormToDB,
  getFormFromDB,
  deleteFormByIdFromDB,
  saveAnswerToDB,
  getAnswerFromDB,
  deleteAnswerByIdFromDB,
} from "../lib/db";
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
import moment from "moment";

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
        form.resetFields();
        deleteAnswerByIdFromDB({ formId });
        deleteFormByIdFromDB({ formId });
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
    checkDB().then((res) => {
      // fill form from dexie
      getAnswerFromDB({ formId })
        .then((res) => {
          if (res?.answer) {
            const data = JSON.parse(res.answer);
            data.forEach(({ question_id, type, answer }) => {
              // check if string a valid date
              if (type === "date" && answer) {
                form.setFieldsValue({
                  [question_id]: moment(answer),
                });
              } else {
                form.setFieldsValue({
                  [question_id]: answer,
                });
              }
            });
            return data;
          }
          return res;
        })
        .then((answerValues) => {
          // load formData from dexie
          // getFormFromDB({ formId }).then((res) => {
          //   if (res) {
          //     dispatch({ type: "INIT FORM", payload: res?.formData });
          //   } else {
          api
            .get(`form/${formId}`)
            .then((res) => {
              let formData = generateForm(res.data);
              // transform formData question group
              // to return repeatable question value if value defined
              let questionGroups = formData?.questionGroup;
              if (answerValues) {
                questionGroups = formData?.questionGroup.map((qg, qgi) => {
                  const findQg = answerValues?.find(
                    (ans) => ans?.qg_index === qgi
                  );
                  return {
                    ...qg,
                    repeat: findQg?.qg_repeat || 1,
                  };
                });
              }
              // add form metadata
              formData = {
                ...formData,
                questionGroup: questionGroups,
                dataPointId: generateDataPointId(),
                deviceId: "Akvo Flow Web",
                submissionStart: Date.now(),
              };
              saveFormToDB({
                formId: formId,
                app: formData?.app,
                version: formData?.version,
                formData: formData,
              });
              dispatch({ type: "INIT FORM", payload: formData });
            })
            .catch((e) => {
              const { status, statusText } = e.response;
              console.error(`${formId}`, status, statusText);
              setError(e.response);
            });
          //   }
          // });
        });
    });
  }, [formId]);

  useEffect(() => {
    if (forms?.surveyId) {
      const questions = questionGroup.flatMap((qg) => {
        const qsTmp = qg.question.map((q) => ({
          ...q,
          // add question group index & repeatable
          qg_index: qg?.index,
          qg_repeat: qg?.repeat,
        }));
        return qsTmp;
      });
      const answer = form.getFieldsValue();
      const transformAnswers = Object.keys(answer).map((key) => {
        const findQuestion = questions.find((q) => q.id === key);
        const value = answer?.[key];
        return {
          question_id: key,
          answer: value,
          type: findQuestion?.type,
          qg_index: findQuestion?.qg_index,
          qg_repeat: findQuestion?.qg_repeat,
        };
      });
      saveAnswerToDB({
        formId: formId,
        answer: JSON.stringify(transformAnswers),
      });
    }
  }, [form.getFieldsValue()]);

  // useEffect(() => {
  //   if (forms?.surveyId) {
  //     // save updated forms to index DB
  //     saveFormToDB({
  //       formId: formId,
  //       app: forms?.app,
  //       version: forms?.version,
  //       formData: forms,
  //     });
  //   }
  // }, [forms]);

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
        form={form}
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
      )}
      {/* Notification Modal */}
      <NotificationModal {...notification} isMobile={isMobile} />
    </Row>
  );
};

export default Home;
