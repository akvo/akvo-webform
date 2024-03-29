import React from "react";
import { Form } from "antd";
import { validateDependency, mapRules, modifyDependency } from "../lib/form.js";
import QuestionField from "./QuestionField";
import dataProviders from "../store";
import { isString } from "../lib/util.js";

const Question = ({ fields, form, group, repeat }) => {
  const { answer } = dataProviders.Values();
  fields = fields.map((field) => {
    if (repeat) {
      return { ...field, id: `${field.id}-${repeat}` };
    }
    return field;
  });
  return fields.map((field, key) => {
    let rules = [];
    if (field?.mandatory) {
      rules = [
        {
          validator: (_, value) => {
            // handle empty multiple options
            if (
              field.type === "option" &&
              Array.isArray(value) &&
              value.length < 1
            ) {
              return Promise.reject(new Error(`${field.text} is required`));
            }
            // handle empty string
            if (isString(value) && value.trim() === "") {
              return Promise.reject(new Error(`${field.text} is required`));
            }
            // handle general empty value
            if (!value) {
              return Promise.reject(new Error(`${field.text} is required`));
            }
            return Promise.resolve();
          },
        },
      ];
    }
    if (field?.validationRule) {
      rules = [...rules, ...mapRules(field)];
    }
    if (field?.dependency) {
      const modifiedDependency = modifyDependency(group, field, repeat);
      return (
        <Form.Item noStyle key={key} shouldUpdate={answer}>
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

export default React.memo(Question);
