import isoLangs from "../lib/isoLangs";
import uniq from "lodash/uniq";

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

const initLang = ({ defaultLanguageCode, altText, questionGroup }) => {
  // iterate question group to get available translation
  let iterateLang = altText;
  const questionGroupAltTexts = questionGroup?.flatMap((qg) => qg?.altText);
  const questions = questionGroup?.flatMap((qg) => qg?.question);
  const questionAltTexts = questions?.flatMap((q) => q?.altText);
  const helpAltTexts = questions?.flatMap((q) => q?.help?.altText);
  const optionAltTexts = questions?.flatMap((q) =>
    q?.options?.option?.flatMap((o) => o?.altText)
  );
  iterateLang = [
    ...iterateLang,
    ...questionGroupAltTexts,
    ...questionAltTexts,
    ...helpAltTexts,
    ...optionAltTexts,
  ]
    .filter((x) => x)
    .map((x) => x?.language);
  iterateLang = uniq(iterateLang);
  // end of iterate

  const isoDefaultLang = isoLangs?.[defaultLanguageCode];
  const defaultLang = {
    language: defaultLanguageCode,
    name: `${isoDefaultLang?.name} / ${isoDefaultLang?.nativeName}`,
  };
  const langList = iterateLang?.map((lang) => {
    const findIsoLang = isoLangs?.[lang];
    return {
      language: lang,
      name: `${findIsoLang?.name} / ${findIsoLang?.nativeName}`,
    };
  });
  return {
    default: defaultLanguageCode,
    active: defaultLanguageCode,
    list: [defaultLang, ...langList],
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
