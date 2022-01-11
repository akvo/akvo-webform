import React from "react";
import { Col, Form } from "antd";
import { validateDependency } from "../lib/form.js";
import TypeOption from "../fields/TypeOption";
import TypeDate from "../fields/TypeDate";
import TypeInput from "../fields/TypeInput";

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
    default:
      return <TypeInput keyform={index} rules={rules} {...field} />;
  }
};

const Question = ({ fields, form, current }) => {
  return fields.map((field, key) => {
    let rules = [];
    if (field?.mandatory) {
      rules = [
        {
          validator: (_, value) =>
            value
              ? Promise.resolve()
              : Promise.reject(new Error(`${field.text} is required`)),
        },
      ];
    }
    if (field?.validationRule) {
      rules = [...rules, ...mapRules(field)];
    }
    if (field?.dependency) {
      return (
        <Form.Item noStyle key={key} shouldUpdate={current}>
          {(f) => {
            const unmatches = field.dependency
              .map((x) => {
                return validateDependency(x, f.getFieldValue(x.question));
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
