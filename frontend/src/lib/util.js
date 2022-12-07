import dataProviders from "../store";

export const roundValue = (value, precision) => {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
};

export const generateAnswerStatsURL = (questionId) => {
  const state = dataProviders.Values();
  const forms = state?.forms || {};
  const {
    alias: instanceName,
    surveyGroupId: surveyId,
    surveyId: formId,
  } = forms;
  const qid =
    questionId && questionId.includes("Q")
      ? parseInt(questionId.replace("Q", ""))
      : parseInt(questionId);
  const url = `/stats?instance_name=${instanceName}&survey_id=${surveyId}&form_id=${formId}&question_id=${qid}`;
  return url;
};
