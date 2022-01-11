import React, { useState, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, Button, Form, Input, List } from "antd";
import Question from "../components/Question";
import { MdRadioButtonChecked, MdCheckCircle } from "react-icons/md";
import intersection from "lodash/intersection";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import { saveFormToDB } from "../lib/db";
import generateForm from "../lib/form";
import reducer, { defaultValue } from "../lib/store";

const Home = () => {
  const [error, setError] = useState(false);
  const { formId } = useParams();
  const [state, dispatch] = useReducer(reducer, defaultValue);
  const { forms } = state;
  const [form] = Form.useForm();
  const [current, setCurrent] = useState({});
  const [activeGroup, setActiveGroup] = useState(0);
  const [completeGroup, setCompleteGroup] = useState([]);

  const onComplete = (values) => {
    console.log(values);
  };

  const onCompleteFailed = (values, errorFields) => {
    console.log(values, errorFields);
  };

  const onValuesChange = (fr, qg, value, values) => {
    const errors = fr.getFieldsError();
    const filled = Object.keys(values)
      .map((k) => ({ id: parseInt(k), value: values[k] }))
      .filter((x) => x.value);
    const incomplete = errors.map((e) => e.name[0]);
    const completeQg = qg
      .map((x, ix) => {
        const ids = x.question.map((q) => q.id);
        const mandatory = intersection(incomplete, ids);
        const filledMandatory = filled.filter((f) => mandatory.includes(f.id));
        return { i: ix, complete: filledMandatory.length === mandatory.length };
      })
      .filter((x) => x.complete);
    setCompleteGroup(completeQg.map((qg) => qg.i));
    setCurrent(values);
    console.log({
      current: value,
      values: values,
      progress: (filled.length / errors.length) * 100,
    });
  };

  useEffect(() => {
    api
      .get(`form/${formId}`)
      .then((res) => {
        const formData = generateForm(res.data);
        saveFormToDB({ formId: formId, ...formData });
        dispatch({ type: "INIT FORM", forms: formData });
      })
      .catch((e) => {
        const { status, statusText } = e.response;
        console.error(`${formId}`, status, statusText);
        setError(e.response);
      });
  }, [formId]);

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
  console.log(forms);

  const lastGroup = activeGroup + 1 === forms?.questionGroup.length;

  return (
    <Row className="container">
      <Col span={24} className="form-header sticky">
        <Row align="middle">
          <Col span={20}>
            <h1>{forms?.name}</h1>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => form.submit()}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </Col>
      <Col span={6} className="sidebar sticky">
        <List
          bordered={false}
          header={<div className="sidebar-header">form overview</div>}
          dataSource={forms?.questionGroup}
          renderItem={(item, key) => (
            <List.Item
              key={key}
              onClick={() => setActiveGroup(key)}
              className={`sidebar-list ${activeGroup === key ? "active" : ""} ${
                completeGroup.includes(key) ? "complete" : ""
              }`}
            >
              {completeGroup.includes(key) ? (
                <MdCheckCircle className="icon" />
              ) : (
                <MdRadioButtonChecked className="icon" />
              )}
              {item?.heading}
            </List.Item>
          )}
        />
      </Col>
      <Col span={18}>
        <Form
          form={form}
          layout="vertical"
          name={forms.name}
          scrollToFirstError="true"
          onValuesChange={(value, values) =>
            setTimeout(() => {
              onValuesChange(form, forms.questionGroup, value, values);
            }, 100)
          }
          onFinish={onComplete}
          onFinishFailed={onCompleteFailed}
        >
          {forms?.questionGroup.map((g, key) => {
            return (
              <Card
                key={key}
                title={<div className="field-group-header">{g.heading}</div>}
                className={`field-group ${activeGroup !== key ? "hidden" : ""}`}
              >
                {g?.description ? (
                  <p className="description">{g.description}</p>
                ) : (
                  ""
                )}
                <Question fields={g.question} form={form} current={current} />
              </Card>
            );
          })}
        </Form>
        {!lastGroup && (
          <Col span={24} className="next">
            <Button
              type="default"
              onClick={() => {
                if (!lastGroup) {
                  setActiveGroup(activeGroup + 1);
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
