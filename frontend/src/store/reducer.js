/* INITIAL LOAD */

const initForms = (payload) => {
  const questionGroup = payload.questionGroup.map((qg, index) => {
    return {
      index: index,
      repeat: 1,
      ...qg,
    };
  });
  return { ...payload, questionGroup: questionGroup };
};

const initDataPointName = ({ questionGroup }) => {
  return questionGroup
    .map((qg) => qg?.question.filter((q) => q.localeNameFlag))
    .flatMap((q) => q)
    .map((x) => ({ id: x.id, value: false }));
};

/* END INIT */

/* UPDATE */

const addAnswer = (answer, data) => {
  answer = answer.filter((x) => x.id !== data.id);
  return [...answer, data];
};

const removeAnswer = (answer, data) => {
  return answer.filter((x) => x.id !== data.id);
};

const updateDataPointName = (state, data) => {
  const answer = Object.keys(data).map((o) => ({
    id: o,
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

/* ENDUPDATE */

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT FORM":
      return {
        ...state,
        forms: initForms(action.payload),
        dataPointName: initDataPointName(action.payload),
      };
    case "UPDATE FORM":
      return {
        ...state,
        forms: action.payload,
      };
    case "ADD ANSWER":
      return { ...state, answers: addAnswer(state.answer, action.payload) };
    case "REMOVE ANSWER":
      return { ...state, answers: removeAnswer(state.answer, action.payload) };
    case "UPDATE DATAPOINTNAME":
      return {
        ...state,
        dataPointName: updateDataPointName(state.dataPointName, action.payload),
      };
    case "UPDATE GROUP":
      return {
        ...state,
        group: { ...state.group, ...action.payload },
      };
    case "UPDATE ANSWER":
      return {
        ...state,
        answer: action.payload,
      };

    default:
      throw new Error();
  }
};

export default reducer;
