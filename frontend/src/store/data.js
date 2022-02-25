const initialValue = {
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
  answer: {},
  active: {
    questionGroup: null,
    repeatQuestionGroup: 1,
  },
  group: { active: 0, complete: [] },
  progress: 0,
  language: {
    defaultLang: "en",
    active: "en",
    list: [],
  },
  auth: {
    isLogin: false,
    submitter: null,
  },
};

export default initialValue;
