import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button, Form } from "antd";
import intersection from "lodash/intersection";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import { saveFormToDB } from "../lib/db";
import generateForm, { transformRequest } from "../lib/form";
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
    console.log("Finish", transformRequest(values));
  };

  const onCompleteFailed = ({ values, errorFields }) => {
    setIsSubmitted(errorFields);
    console.log("Failed", transformRequest(values), errorFields);
  };

  const onValuesChange = (qg, value, values) => {
    const errors = form.getFieldsError();
    const filled = Object.keys(values)
      .map((k) => ({ id: k, value: values[k] }))
      .filter((x) => x.value);
    const incomplete = errors.map((e) => e.name[0]);
    const completeQg = qg
      .map((x, ix) => {
        const suffix = x?.repeatable
          ? x?.repeat > 1
            ? `-${x.repeat - 1}`
            : ""
          : "";
        const ids = x.question.map((q) => `${q.id}${suffix}`);
        const mandatory = intersection(incomplete, ids);
        const filledMandatory = filled.filter((f) => mandatory.includes(f.id));
        return {
          i: x?.repeatable ? `${ix}-${x?.repeat}` : ix,
          complete: filledMandatory.length === mandatory.length,
        };
      })
      .filter((x) => x.complete);
    const isDpName = dataPointName.find((x) => x.id === Object.keys(value)[0]);
    dispatch({
      type: "UPDATE ANSWER",
      payload: {
        answer: values,
        group: {
          complete: [
            ...new Set([...complete, ...completeQg.map((qg) => qg.i)]),
          ],
        },
        dataPointName: isDpName && value,
        progress: (filled.length / errors.length) * 100,
      },
    });
  };

  useEffect(() => {
    api
      .get(`form/${formId}`)
      .then((res) => {
        const formData = generateForm(res.data);
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
  }, [active, complete, questionGroup]);

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
