import React from "react";
import { Form } from "antd";
import { validateDependency } from "../lib/form.js";
import QuestionField from "./QuestionField";

const mapRules = ({ validationRule, type }) => {
  if (type === "free" && validationRule?.validationType === "numeric") {
    let rule = {};
    if (validationRule?.minVal) {
      rule = { min: validationRule?.minVal };
    }
    if (validationRule?.maxVal) {
      rule = { ...rule, max: validationRule?.maxVal };
    }
    return [{ ...rule, type: "number" }];
  }
  return [{}];
};

const Question = ({ fields, form, group, current, repeat }) => {
  fields = fields.map((field) => {
    if (repeat) {
      return { ...field, id: field.id + repeat / 10 };
    }
    return field;
  });
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
      const questionInGroup = group.question.map((q) => q.id);
      const modifiedDependency = field.dependency.map((d) => {
        if (questionInGroup.includes(d.question) && repeat) {
          return { ...d, question: d.question + repeat / 10 };
        }
        return d;
      });
      return (
        <Form.Item noStyle key={key} shouldUpdate={current}>
          {(f) => {
            const unmatches = modifiedDependency
              .map((x) => {
                return validateDependency(x, f.getFieldValue(x.question));
              })
              .filter((x) => x === false);
            return unmatches.length ? null : (
              <QuestionField
                repeat={repeat}
                rules={rules}
                form={form}
                index={key}
                field={field}
              />
            );
          }}
        </Form.Item>
      );
    }
    return (
      <QuestionField
        repeat={repeat}
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
