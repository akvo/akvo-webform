export const defaultValue = {
  forms: {
    altText: [],
    name: "Loading...",
    questionGroup: "Loading...",
    surveyId: null,
    questionGroup: [
      {
        altText: [],
        heading: "Loading...",
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
      },
    ],
  },
  answers: [],
  active: {
    questionGroup: null,
    repeatQuestionGroup: 1,
  },
};

const addAnswer = (answer, input) => {
  answer = answer.filter((x) => x.id !== input.id);
  return [...answer, input];
};
const removeAnswer = (answer, input) => {
  return answer.filter((x) => x.id !== input.id);
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT FORM":
      return { ...state, forms: action.forms };
    case "ADD ANSWER":
      return { ...state, answers: addAnswer(state.answer, action.input) };
    case "REMOVE ANSWER":
      return { ...state, answers: removeAnswer(state.answer, action.input) };
    default:
      throw new Error();
  }
};

export default reducer;
