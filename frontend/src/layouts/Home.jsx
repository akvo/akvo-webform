import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Button, Form, List } from "antd";
import {
  MdRadioButtonUnchecked,
  MdRadioButtonChecked,
  MdCheckCircle,
  MdRepeat,
} from "react-icons/md";
import intersection from "lodash/intersection";
import ErrorPage from "./ErrorPage";
import api from "../lib/api";
import { saveFormToDB } from "../lib/db";
import generateForm from "../lib/form";
import dataProviders from "../store";
import { QuestionGroup, FormHeader } from "../components";

const Home = () => {
  const [error, setError] = useState(false);
  const { formId } = useParams();
  const dispatch = dataProviders.Actions();
  const state = dataProviders.Values();
  const { forms, dataPointName } = state;
  const [form] = Form.useForm();
  const [current, setCurrent] = useState({});
  const [activeGroup, setActiveGroup] = useState(0);
  const [completeGroup, setCompleteGroup] = useState([]);
  const [repeat, setRepeat] = useState(1);

  const onComplete = (values) => {
    console.log("finish");
    console.log(values);
  };

  const onCompleteFailed = ({ values, errorFields }) => {
    console.log(values, errorFields);
  };

  const onValuesChange = (qg, value, values) => {
    const errors = form.getFieldsError();
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
    const isDpName = dataPointName.find(
      (x) => x.id === parseInt(Object.keys(value)[0])
    );
    if (isDpName) {
      dispatch({ type: "UPDATE DATAPOINTNAME", payload: value });
    }
    /*
    console.log({
      current: value,
      values: values,
      progress: (filled.length / errors.length) * 100,
    });
    */
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

  const lastGroup = activeGroup + 1 === forms?.questionGroup.length;

  return (
    <Row className="container">
      <FormHeader
        forms={forms}
        submit={() => form.submit()}
        dataPointName={dataPointName}
        repeat={repeat}
        setRepeat={setRepeat}
      />
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
              ) : activeGroup === key ? (
                <MdRadioButtonChecked className="icon" />
              ) : (
                <MdRadioButtonUnchecked className="icon" />
              )}
              {item?.heading}
              {item?.repeatable ? <MdRepeat className="icon icon-right" /> : ""}
            </List.Item>
          )}
        />
      </Col>
      <Col span={18} className="main">
        <Form
          form={form}
          layout="vertical"
          name={forms.name}
          scrollToFirstError="true"
          onValuesChange={(value, values) =>
            setTimeout(() => {
              onValuesChange(forms.questionGroup, value, values);
            }, 100)
          }
          onFinish={onComplete}
          onFinishFailed={onCompleteFailed}
        >
          {forms?.questionGroup.map((group, key) => {
            return (
              <QuestionGroup
                key={key}
                form={form}
                current={current}
                activeGroup={activeGroup}
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
