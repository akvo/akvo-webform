import isoLangs from "../lib/isoLangs";

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

const initLang = ({ defaultLanguageCode, altText }) => {
  const langList = altText?.map((lang) => {
    const findIsoLang = isoLangs[lang?.language];
    return {
      language: lang?.language,
      name: `${findIsoLang?.name} / ${findIsoLang?.nativeName}`,
    };
  });
  return {
    active: defaultLanguageCode,
    list: langList,
  };
};

/* END INIT */

/* UPDATE */

const updateDataPointName = (state, data) => {
  if (!data) {
    return state;
  }
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
    case "UPDATE GROUP":
      return {
        ...state,
        group: { ...state.group, ...action.payload },
      };
    case "UPDATE ANSWER":
      return {
        ...state,
        answer: action.payload.answer,
        group: { ...state.group, ...action.payload.group },
        dataPointName: updateDataPointName(
          state.dataPointName,
          action.payload?.dataPointName
        ),
        progress: action.payload.progress,
      };
    case "INIT LANGUAGE":
      return {
        ...state,
        language: initLang(action.payload),
      };
    case "UPDATE LANGUAGE":
      return {
        ...state,
        language: {
          ...state.language,
          active: action.payload,
        },
      };

    default:
      throw new Error();
  }
};

export default reducer;
