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

export const transformRequest = (questionGroup, values) => {
  const questions = questionGroup.flatMap((qg) => qg.question);
  return Object.keys(values).map((key) => {
    const keyTemp = key.split("-")[0]; // to get only question id for repeat answer
    const findQuestion = questions.find((q) => q.id === keyTemp);
    return {
      questionId: key.replace("Q", "").split("-")[0],
      iteration: parseInt(key.split("-")[1] || 0),
      answerType: findQuestion?.type,
      value: values[key],
    };
  });
};

export const checkFilledForm = (
  errorFields,
  dataPointName,
  qg,
  value,
  values
) => {
  const filled = Object.keys(values)
    .map((k) => ({ id: k, value: values[k] }))
    .filter((x) => x.value);
  const incomplete = errorFields.map((e) => e.name[0]);
  const completeQg = qg
    .map((x, ix) => {
      // handle repeat group question
      let ids = x.question.map((q) => q.id);
      let ixs = [ix];
      if (x?.repeatable) {
        let iter = x?.repeat;
        const suffix = iter > 1 ? `-${iter - 1}` : "";
        do {
          const rids = x.question.map((q) => `${q.id}${suffix}`);
          ids = [...ids, ...rids];
          ixs = [...ixs, `${ix}-${iter}`];
          iter--;
        } while (iter > 0);
      }
      // end of handle repeat group question
      const mandatory = intersection(incomplete, ids);
      const filledMandatory = filled.filter((f) => mandatory.includes(f.id));
      return {
        i: ixs,
        complete: filledMandatory.length === mandatory.length,
      };
    })
    .filter((x) => x.complete);
  const isDpName = dataPointName.find((x) => x.id === Object.keys(value)[0]);
  return { filled, completeQg, isDpName };
};

export const generateDataPointNameDisplay = (dataPointName) =>
  dataPointName
    .filter((x) => x.value)
    .map((x) => x.value)
    .join(" - ");

export default generateForm;
