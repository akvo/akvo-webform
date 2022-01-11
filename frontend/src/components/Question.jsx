import React from "react";
import { Col, Form } from "antd";
import intersection from "lodash/intersection";
import TypeOption from "../fields/TypeOption";
import TypeDate from "../fields/TypeDate";
import TypeNumber from "../fields/TypeNumber";
import TypeInput from "../fields/TypeInput";
import TypeText from "../fields/TypeText";

const mapRules = ({ rule, type }) => {
  if (type === "number") {
    return [{ ...rule, type: "number" }];
  }
  return [{}];
};

const QuestionFields = ({ rules, index, field }) => {
  switch (field.type) {
    case "option":
      return <TypeOption keyform={index} rules={rules} {...field} />;
    case "date":
      return <TypeDate keyform={index} rules={rules} {...field} />;
    case "number":
      return <TypeNumber keyform={index} rules={rules} {...field} />;
    case "text":
      return <TypeText keyform={index} rules={rules} {...field} />;
    default:
      return <TypeInput keyform={index} rules={rules} {...field} />;
  }
};

const validateDependency = (dependency, value) => {
  if (dependency?.options) {
    if (typeof value === "string") {
      value = [value];
    }
    return intersection(dependency.options, value)?.length > 0;
  }
  let valid = false;
  if (dependency?.min) {
    valid = value >= dependency.min;
  }
  if (dependency?.max) {
    valid = value <= dependency.max;
  }
  return valid;
};

const Question = ({ fields, form, current }) => {
  return fields.map((field, key) => {
    let rules = [];
    if (field?.required) {
      rules = [
        {
          validator: (_, value) =>
            value
              ? Promise.resolve()
              : Promise.reject(new Error(`${field.text} is required`)),
        },
      ];
    }
    if (field?.rule) {
      rules = [...rules, ...mapRules(field)];
    }
    if (field?.dependency) {
      return (
        <Form.Item noStyle key={key} shouldUpdate={current}>
          {(f) => {
            const unmatches = field.dependency
              .map((x) => {
                return validateDependency(x, f.getFieldValue(x.id));
              })
              .filter((x) => x === false);
            return unmatches.length ? null : (
              <QuestionFields rules={rules} index={key} field={field} />
            );
          }}
        </Form.Item>
      );
    }
    return (
      <QuestionFields
        rules={rules}
        form={form}
        key={key}
        index={key}
        field={field}
      />
    );
  });
};

export default Question;
