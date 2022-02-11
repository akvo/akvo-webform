import Dexie from "dexie";

const db = new Dexie("akvo");
db.version(1).stores({
  forms: "formId, app, version",
  answers: "formId",
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

export const getFormFromDB = ({ formId }) => db.forms.get(formId);

export const deleteFormByIdFromDB = ({ formId }) => {
  db.forms.delete(formId);
  db.forms.clear();
};

export const saveAnswerToDB = ({ formId, answer }) => {
  db.answers.clear();
  db.answers.add({ formId, answer });
};

export const getAnswerFromDB = ({ formId }) => db.answers.get(formId);

export const deleteAnswerByIdFromDB = ({ formId }) => {
  db.answers.delete(formId);
  db.answers.clear();
};

export default db;
