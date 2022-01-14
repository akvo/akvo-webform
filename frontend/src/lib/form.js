import intersection from "lodash/intersection";

export const validateDependency = (dependency, value) => {
  if (typeof value === "string") {
    value = [value];
  }
  return intersection(dependency.answerValue, value)?.length > 0;
};

const getDependencyAncestors = (questions, initial, dependencies) => {
  const ids = dependencies.map((x) => x.question);
  const ancestors = questions
    .filter((q) => ids.includes(q.id))
    .filter((q) => q?.dependency);
  if (ancestors.length) {
    dependencies = ancestors.map((x) => x.dependency);
    initial = [initial, ...dependencies].flatMap((x) => x);
    ancestors.forEach((a) => {
      if (a?.dependency) {
        initial = getDependencyAncestors(questions, initial, a.dependency);
      }
    });
  }
  return initial;
};

const generateForm = (form) => {
  const questions = form.questionGroup.map((x) => x.question).flatMap((x) => x);

  const transformed = questions.map((x) => {
    if (x?.dependency) {
      return {
        ...x,
        dependency: getDependencyAncestors(
          questions,
          x.dependency,
          x.dependency
        ),
      };
    }
    return x;
  });

  return {
    ...form,
    questionGroup: form.questionGroup.map((qg) => {
      return {
        ...qg,
        question: qg.question.map((q) => {
          return transformed.find((t) => t.id === q.id);
        }),
      };
    }),
  };
};

export const mapRules = ({ validationRule, type }) => {
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

export const modifyDependency = ({ question }, { dependency }, repeat) => {
  const questions = question.map((q) => q.id);
  return dependency.map((d) => {
    if (questions.includes(d.question) && repeat) {
      return { ...d, question: `${d.question}-${repeat}` };
    }
    return d;
  });
};

export const transformRequest = (values) => {
  return Object.keys(values).map((key) => {
    return {
      id: key.replace("Q", "").split("-")[0],
      repeat: parseInt(key.split("-")[1] || 0),
      value: values[key],
    };
  });
};

export default generateForm;
