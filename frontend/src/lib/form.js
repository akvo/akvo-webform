import intersection from "lodash/intersection";
import uuid from "uuid/v4";
import moment from "moment";

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
      let repeats = {};
      if (qg?.repeatable) {
        repeats = { repeats: [0] };
      }
      return {
        ...qg,
        ...repeats,
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
  const res = Object.keys(values).map((key) => {
    const keyTemp = key.split("-")[0]; // to get only question id for repeat answer
    const findQuestion = questions.find((q) => q.id === keyTemp);
    const answerType = findQuestion?.type;
    let value = values[key];
    // transform date value
    if (answerType === "date" && value) {
      value = moment(value).format("YYYY-MM-DD");
    }
    const iteration = key.split("-")[1] || 0;
    const result = {
      questionId: key.replace("Q", "").split("-")[0],
      iteration: isNaN(iteration) ? null : parseInt(iteration),
      answerType: answerType,
      value: value || "",
    };
    if (answerType === "option" && iteration === "other") {
      // other option key = "{questionId}-other"
      result.isOther = true;
    }
    return result;
  });
  const otherOptionAnswers = res.filter(
    (r) => r.answerType === "option" && r.isOther === true
  );
  const optionAnswers = res
    .filter((r) => r.answerType === "option" && !r.isOther)
    .map((r) => {
      const otherAnswer = otherOptionAnswers.find(
        (o) => o.questionId === r.questionId
      );
      const value = Array.isArray(r.value)
        ? r.value.map((v) =>
            otherAnswer && v === "%other%"
              ? { text: otherAnswer.value, isOther: true }
              : { text: v }
          )
        : otherAnswer && r.value === "%other%"
        ? { text: otherAnswer.value, isOther: true }
        : { text: r.value };
      return { ...r, value };
    });

  const nonOptionAnswers = res.filter((r) => r.answerType !== "option");
  const result = [...nonOptionAnswers, ...optionAnswers];

  // find geo question, check for localeNameFlag
  // localeNameFlag === true, add meta_geo responses
  const qGeo = questions?.find((q) => q.type === "geo");
  const geoAnswer = values[qGeo?.id];
  if (qGeo?.localeNameFlag) {
    const { lat, lng } = geoAnswer;
    const metaGeoValue = `${lat}|${lng}|0`;
    return [
      ...result,
      {
        questionId: "-2",
        iteration: 0,
        answerType: "meta_geo",
        value: metaGeoValue,
      },
    ];
  }
  return result;
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

export const generateDataPointNameDisplay = (dataPointName, form) => {
  const newDataPointName = dataPointName.map((x) => {
    let findValue = form.getFieldValue(x?.id);
    if (Array.isArray(findValue)) {
      findValue = findValue?.map((x) => x?.name || x)?.join(" - ");
    }
    return {
      ...x,
      value: x?.value || findValue || false,
    };
  });
  return newDataPointName
    .filter((x) => x.value)
    .map((x) => x.value)
    .join(" - ");
};

export const generateDataPointId = () => {
  const dataPointId = [
    Math.random().toString(36).slice(2).substring(1, 5),
    Math.random().toString(36).slice(2).substring(1, 5),
    Math.random().toString(36).slice(2).substring(1, 5),
  ];
  return dataPointId.join("-");
};

export const generateUUID = () => {
  let id = uuid();
  id = id.split("-");
  id = id
    .map((x) => {
      return x.substring(0, 4);
    })
    .slice(0, 3);
  return id.join("-");
};

export const updateRepeat = (
  value,
  index,
  state,
  dispatch,
  operation,
  repeatIndex = null
) => {
  const { forms, group } = state;
  const current = forms.questionGroup.find((x) => x.index === index);
  const updated = forms.questionGroup.map((x) => {
    const isRepeatsAvailable = x?.repeats && x?.repeats?.length;
    const repeatNumber = isRepeatsAvailable
      ? x.repeats[x.repeats.length - 1] + 1
      : value - 1;
    let repeats = isRepeatsAvailable ? x.repeats : [0];
    if (x.index === index) {
      if (operation === "add") {
        repeats = [...repeats, repeatNumber];
      }
      if (operation === "delete") {
        repeats.pop();
      }
      if (operation === "delete-selected" && repeatIndex !== null) {
        repeats = repeats.filter((r) => r !== repeatIndex);
      }
      return { ...current, repeat: value, repeats: repeats };
    }
    return x;
  });
  dispatch({
    type: "UPDATE FORM",
    payload: { ...forms, questionGroup: updated },
  });
  dispatch({
    type: "UPDATE GROUP",
    payload: {
      complete: group.complete.filter((c) => c !== `${index}-${value + 1}`),
    },
  });
};

export default generateForm;
