import Dexie from "dexie";

const db = new Dexie("akvo");
db.version(3).stores({
  forms: "formId, app, version",
  answers: "cacheId, formId, dataPointId",
});

export const checkDB = () =>
  Dexie.exists("akvo")
    .then((exists) => {
      if (exists) {
        console.info("Database exists");
      } else {
        console.info("Database doesn't exist");
      }
    })
    .catch((e) => {
      console.error(
        "Oops, an error occurred when trying to check database existance"
      );
      console.error(e);
    });

export const saveFormToDB = ({ formId, app, version, formData }) => {
  db.forms.clear();
  db.forms.add({ formId, app, version, formData });
};

export const getFormFromDB = (formId) => db.forms.get(formId);

export const deleteFormByIdFromDB = (formId) => {
  db.forms.delete(formId);
  db.forms.clear();
};

export const saveAnswerToDB = ({
  cacheId,
  formId,
  formName,
  surveyGroupName,
  dataPointId,
  dataPointName,
  submissionStart,
  answer,
}) => {
  db.answers.delete(cacheId);
  db.answers.add({
    cacheId,
    formId,
    formName,
    surveyGroupName,
    dataPointId,
    dataPointName,
    submissionStart,
    answer,
  });
};

export const getAllAnswerFromDB = () => db.answers.toArray();

export const getAnswerFromDB = (cacheId) => db.answers.get(cacheId);

export const deleteAnswerByIdFromDB = (cacheId) => db.answers.delete(cacheId);

export default db;
