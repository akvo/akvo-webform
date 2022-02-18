import Dexie from "dexie";

const db = new Dexie("akvo");
db.version(2).stores({
  forms: "formId, app, version",
  answers: "cacheId, formId, dataPointId",
});

export const checkDB = () =>
  Dexie.exists("akvo")
    .then((exists) => {
      if (exists) {
        console.log("Database exists");
      } else {
        console.log("Database doesn't exist");
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
  dataPointId,
  submissionStart,
  answer,
}) => {
  db.answers.delete(cacheId);
  db.answers.add({
    cacheId,
    formId,
    formName,
    dataPointId,
    submissionStart,
    answer,
  });
};

export const getAnswerFromDB = (cacheId) => db.answers.get(cacheId);

export const deleteAnswerByIdFromDB = (cacheId) => db.answers.delete(cacheId);

export default db;
