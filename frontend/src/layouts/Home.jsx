import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button, Form } from "antd";
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
import { QuestionGroup, FormHeader, Sidebar } from "../components";

const Home = () => {
  const [error, setError] = useState(false);
  const { formId } = useParams();
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { forms, dataPointName, group } = state;
  const { questionGroup } = forms;
  const { active, complete } = group;
  const [form] = Form.useForm();
  const [isSubmitted, setIsSubmitted] = useState([]);

  const onComplete = (values) => {
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
        console.log(res?.data);
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(status, statusText);
        // setError(e.response);
      });
  };

  const onCompleteFailed = ({ values, errorFields }) => {
    setIsSubmitted(errorFields);
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
      isSubmitted: isSubmitted,
    };
  }, [active, complete, questionGroup, isSubmitted]);

  if (error) {
    return (
      <ErrorPage
        status={error.status}
        title={"Error Loading Form"}
        messages={[`Form Id ${formId} is not found`]}
      />
    );
  }

  if (!forms) {
    console.log("Loading");
  }

  const lastGroup = active + 1 === questionGroup.length;

  return (
    <Row className="container">
      <FormHeader submit={() => form.submit()} />
      <Col span={6} className="sidebar sticky">
        <Sidebar {...sidebarProps} />
      </Col>
      <Col span={18} className="main">
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
        {!lastGroup && (
          <Col span={24} className="next">
            <Button
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
    </Row>
  );
};

export default Home;
