export const defaultValue = {
  form: {
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
            altText: [],
            help: { altText: [], text: "Loading" },
            localeNameFlag: true,
            type: "free",
            text: "Loading...",
          },
        ],
      },
    ],
  },
  answer: [],
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
      return { ...state, form: action.form };
    case "ADD ANSWER":
      return { ...state, answer: addAnswer(state.answer, action.input) };
    case "REMOVE ANSWER":
      return { ...state, answer: removeAnswer(state.answer, action.input) };
    default:
      throw new Error();
  }
};

export default reducer;
