import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Button, Form } from "antd";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import {
  checkDB,
  saveFormToDB,
  deleteFormByIdFromDB,
  saveAnswerToDB,
  getAllAnswerFromDB,
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
  SubmissionListDrawer,
  Login,
} from "../components";
import uuid from "uuid/v4";
import moment from "moment";
import range from "lodash/range";

const saveFeature = true;
const detectMobile = () => {
  //** Use references from https://stackoverflow.com/a/11381730 */
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];
  const mobileBrowser = toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
  return (
    window.matchMedia("only screen and (max-width: 1064px)").matches ||
    mobileBrowser
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const { formId, cacheId } = useParams();
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { forms, dataPointName, group, auth } = state;
  const { questionGroup } = forms;
  const { active, complete } = group;
  const { isLogin, submitter } = auth;
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [isSubmitFailed, setIsSubmitFailed] = useState([]);
  const [notification, setNotification] = useState({ isVisible: false });
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [submissionList, setSubmissionList] = useState([]);
  const [isMobile, setIsMobile] = useState(detectMobile());

  // check screen size or mobile browser
  window.addEventListener("resize", () => {
    setIsMobile(detectMobile());
  });

  // check before refresh
  window.addEventListener("beforeunload", (e) => {
    const submitted = localStorage.getItem("submitted"); // to handle show dirty popup
    if (!isLogin || submitted) {
      return null;
    }
    e.preventDefault();
    const confirmationMessage =
      "If you leave before saving, your changes will be lost." +
      "Are you sure want to reload?";
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
  });

  // handle load page
  window.addEventListener("load", (e) => {
    localStorage.removeItem("submitted"); // to handle show dirty popup
    e.preventDefault();
  });

  const isSaveFeatureEnabled = useMemo(
    () => saveFeature && !isMobile,
    [isMobile]
  );

  const fetchSubmissionList = () => {
    // get all submission list from indexedDB
    getAllAnswerFromDB().then((res) => {
      setSubmissionList(res);
    });
  };

  const fethSubmissionByCache = useCallback(
    (cacheId) => {
      return cacheId
        ? getAnswerFromDB(cacheId).then((res) => {
            if (res?.answer) {
              const data = JSON.parse(res.answer);
              // fill form
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
              return { ...res, answer: data };
            }
            return res;
          })
        : new Promise((resolve) => resolve({}));
    },
    [form]
  );

  const submitForm = (values) => {
    setIsSubmit(true);
    const responses = transformRequest(questionGroup, values);
    const dataPointNameDisplay = generateDataPointNameDisplay(
      dataPointName,
      form
    );
    const filteredResponses = responses.filter((r) => r.iteration !== null);
    const data = {
      dataPointId: forms?.dataPointId,
      deviceId: forms?.deviceId,
      formId: forms?.surveyId,
      formVersion: forms?.version,
      instance: forms?.app,
      submissionStart: forms?.submissionStart,
      submissionStop: Date.now(),
      username: submitter || "akvo-webform",
      dataPointName: dataPointNameDisplay || "Untitled",
      responses: filteredResponses,
    };
    api
      .post(`/submit-form?`, data, { "content-type": "application/json" })
      .then(() => {
        localStorage.setItem("submitted", true); // to handle show dirty popup
        form.resetFields();
        deleteAnswerByIdFromDB(forms?._cacheId);
        deleteFormByIdFromDB(formId);
        setIsSubmit(false);
        // set notification button event
        setNotification({
          isVisible: true,
          type: "success",
          onOk: () => {
            // reset form
            dispatch({
              type: "INIT FORM",
              payload: forms,
            });
            // reset answer
            dispatch({
              type: "UPDATE ANSWER",
              payload: {
                answer: {},
                group: {
                  active: 0,
                  complete: [],
                },
                progress: 0,
              },
            });
            setNotification({ isVisible: false });
            localStorage.removeItem("submitted"); // to handle show dirty popup
            // clear cacheId from URL if any
            let URL = window.location.pathname;
            if (URL.split("/").length > 2 && URL.includes(cacheId)) {
              URL = URL.split("/")?.[1];
              window.history.pushState(
                "",
                document.title,
                `${window.location.origin}/${URL}`
              );
            }
          },
          onCancel: () => {
            setNotification({ isVisible: false });
            localStorage.removeItem("submitted"); // to handle show dirty popup
            setTimeout(() => {
              navigate(`/${formId}/info`);
            }, 100);
          },
        });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
        setIsSubmit(false);
        setError(e.response);
      });
  };

  const onComplete = (values) => {
    setNotification({
      isVisible: true,
      type: "captcha",
      onCancel: () => setNotification({ isVisible: false }),
      onOk: () => {
        setNotification({ isVisible: false });
        submitForm(values);
      },
    });
  };

  const onCompleteFailed = ({ errorFields }) => {
    setIsSubmitFailed(errorFields);
    setNotification({
      isVisible: true,
      type: "submit-failed",
      onCancel: () => setNotification({ isVisible: false }),
    });
  };

  const onSaveSuccess = (_cache) => {
    let savedLink = window.location.href;
    savedLink = savedLink.includes(_cache)
      ? savedLink
      : `${savedLink}/${_cache}`;
    setIsSave(false);
    setNotification({
      isVisible: true,
      type: "save-success",
      onCancel: () => setNotification({ isVisible: false }),
      savedLink: savedLink,
    });
  };

  // Save submission to IndexedDB
  const onSave = () => {
    const {
      _cacheId,
      surveyId,
      name,
      dataPointId,
      submissionStart,
      surveyGroupName,
    } = forms;
    if (surveyId) {
      setIsSave(true);
      const answer = form.getFieldsValue();
      const questions = questionGroup.flatMap((qg) => {
        const qsTmp = qg.question.map((q) => ({
          ...q,
          // add question group index & repeatable
          qg_index: qg?.index,
          qg_repeat: qg?.repeat,
        }));
        return qsTmp;
      });
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
      const dataPointNameDisplay = generateDataPointNameDisplay(
        dataPointName,
        form
      );
      saveAnswerToDB({
        cacheId: _cacheId,
        formId: formId,
        formName: name,
        surveyGroupName: surveyGroupName,
        dataPointId: dataPointId,
        dataPointName: dataPointNameDisplay || "Untitled",
        submissionStart: submissionStart,
        answer: JSON.stringify(transformAnswers),
      });
      setTimeout(() => {
        localStorage.setItem("submitted", true); // to handle show dirty popup
        onSaveSuccess(_cacheId);
        fetchSubmissionList();
      }, 100);
    }
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
    if (!forms?.surveyId) {
      fetchSubmissionList();
      checkDB().then(() => {
        fethSubmissionByCache(cacheId).then((answerValues) => {
          api
            .get(`form/${formId}`)
            .then((res) => {
              let formData = generateForm(res.data);
              // ##TODO:: Create example for conditional passcode
              /**
               * passcode True: ["boq26jv0vava0a6", "6h12auccv5cevp5"]
               * passcode False: ["boq26jv0w-wvvk6", "6h12afe7ffcevf5"]
               */
              let passcode = formData?.passcode;
              if (["boq26jv0vava0a6", "6h12auccv5cevp5"].includes(formId)) {
                passcode = true;
              }
              if (["boq26jv0w-wvvk6", "6h12afe7ffcevf5"].includes(formId)) {
                passcode = false;
              }
              formData = {
                ...formData,
                passcode: passcode,
              };
              // END OF##TODO:: Create example for conditional passcode

              // transform formData question group
              // to return repeatable question value if value defined
              let questionGroups = formData?.questionGroup;
              if (answerValues?.answer) {
                questionGroups = formData?.questionGroup.map((qg, qgi) => {
                  const findQg = answerValues?.answer?.find(
                    (ans) => ans?.qg_index === qgi
                  );
                  const repeat = findQg?.qg_repeat || 1;
                  return {
                    ...qg,
                    repeat: repeat,
                    repeats: range(repeat),
                  };
                });
              }
              // add form metadata when form loaded
              formData = {
                ...formData,
                questionGroup: questionGroups,
                dataPointId: answerValues?.dataPointId || generateDataPointId(),
                deviceId: "AkvoFlow Webforms",
                submissionStart: answerValues?.submissionStart || Date.now(),
                _cacheId: cacheId || uuid(),
              };
              saveFormToDB({
                formId: formId,
                app: formData?.app,
                version: formData?.version,
                formData: formData,
              });
              dispatch({ type: "INIT FORM", payload: formData });
              dispatch({ type: "INIT LANGUAGE", payload: formData });
            })
            .catch((e) => {
              const { status, statusText } = e.response;
              console.error(`${formId}`, status, statusText);
              setError(e.response);
            });
        });
      });
    }
  }, [forms, formId, cacheId, dispatch, fethSubmissionByCache]);

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

  if (!isLogin) {
    return <Login />;
  }

  if (!forms) {
    console.info("Loading");
  }

  const lastGroup = active + 1 === questionGroup.length;

  return (
    <Row className="container">
      <FormHeader
        submit={() => form.submit()}
        isSubmit={isSubmit}
        isMobile={isMobile}
        form={form}
        onSave={onSave}
        isSave={isSave}
        isSaveFeatureEnabled={isSaveFeatureEnabled}
        setNotification={setNotification}
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
          onSave={onSave}
          isSave={isSave}
          isSaveFeatureEnabled={isSaveFeatureEnabled}
        />
      )}
      {/* Notification Modal */}
      <NotificationModal {...notification} isMobile={isMobile} />
      {/* Saved submissions drawer */}
      {!isMobile && submissionList.length && (
        <SubmissionListDrawer
          submissionList={submissionList}
          fetchSubmissionList={fetchSubmissionList}
          setNotification={setNotification}
        />
      )}
    </Row>
  );
};

export default Home;
