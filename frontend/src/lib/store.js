export const defaultValue = {
  forms: {
    altText: [],
    name: "Loading...",
    surveyId: null,
    questionGroup: [
      {
        altText: [],
        heading: "Loading...",
        index: 1,
        question: [
          {
            id: 0,
            order: 1,
            altText: [],
            help: { altText: [], text: "Loading" },
            localeNameFlag: true,
            type: "free",
            mandatory: false,
            text: "Loading...",
          },
          {
            id: 1,
            order: 2,
            altText: [],
            help: { altText: [], text: "Loading" },
            localeNameFlag: true,
            type: "free",
            mandatory: false,
            text: "Loading...",
            validationRule: {
              allowDecimal: false,
              signed: false,
              validationType: "numeric",
            },
            dependency: [{ answerValue: [], question: 0 }],
          },
        ],
        repeatable: true,
        repeat: 1,
      },
    ],
  },
  dataPointName: [
    { id: 1, value: false },
    { id: 2, value: false },
  ],
  answers: [],
  active: {
    questionGroup: null,
    repeatQuestionGroup: 1,
  },
};

const initForms = ({ forms }) => {
  const questionGroup = forms.questionGroup.map((qg, index) => {
    return {
      index: index,
      repeat: 1,
      ...qg,
    };
  });
  return { ...forms, questionGroup: questionGroup };
};

const initDataPointName = ({ questionGroup }) => {
  return questionGroup
    .map((qg) => qg?.question.filter((q) => q.localeNameFlag))
    .flatMap((q) => q)
    .map((x) => ({ id: x.id, value: false }));
};

const addAnswer = (answer, data) => {
  answer = answer.filter((x) => x.id !== data.id);
  return [...answer, data];
};
const removeAnswer = (answer, data) => {
  return answer.filter((x) => x.id !== data.id);
};

const updateDataPointName = (state, data) => {
  const answer = Object.keys(data).map((o) => ({
    id: parseInt(o),
    value: data[o],
  }))[0];

  const res = state.map((s) => {
    if (s.id === answer.id) {
      return { ...s, value: answer.value };
    }
    return s;
  });
  return res;
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT FORM":
      return {
        ...state,
        forms: initForms(action),
        dataPointName: initDataPointName(action.forms),
      };
    case "UPDATE FORM":
      return {
        ...state,
        forms: action.forms,
      };
    case "ADD ANSWER":
      return { ...state, answers: addAnswer(state.answer, action.data) };
    case "REMOVE ANSWER":
      return { ...state, answers: removeAnswer(state.answer, action.data) };
    case "UPDATE DATAPOINTNAME":
      return {
        ...state,
        dataPointName: updateDataPointName(state.dataPointName, action.data),
      };
    default:
      throw new Error();
  }
};

export default reducer;
