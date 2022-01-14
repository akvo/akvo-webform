import intersection from "lodash/intersection";

export const validateDependency = (dependency, value) => {
  if (typeof value === "string") {
    value = [value];
  }
  return intersection(dependency.answerValue, value)?.length > 0;
};

const getDependencyAncestors = (questions, current, dependencies) => {
  const ids = dependencies.map((x) => x.question);
  const ancestors = questions
    .filter((q) => ids.includes(q.id))
    .filter((q) => q?.dependency);
  if (ancestors.length) {
    dependencies = ancestors.map((x) => x.dependency);
    current = [current, ...dependencies].flatMap((x) => x);
    ancestors.forEach((a) => {
      if (a?.dependency) {
        current = getDependencyAncestors(questions, current, a.dependency);
      }
    });
  }
  return current;
};

const generateForm = (form) => {
  const questions = form?.questionGroup
    .map((x) => x.question)
    .flatMap((x) => x);

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

export const transformRequest = (values) => {
  return Object.keys(values).map((key) => {
    const id = parseInt(key);
    const repeat = (parseFloat(key) - id) * 10;
    return { id: id, repeat: parseInt(repeat), value: values[key] };
  });
};

export default generateForm;
