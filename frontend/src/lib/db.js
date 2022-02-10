import Dexie from "dexie";

const db = new Dexie("akvo");
db.version(1).stores({
  forms: "formId, app, version",
  answers: "formId",
});

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

export const saveFormToDB = ({ formId, app, version, name, questionGroup }) => {
  db.forms.clear();
  db.forms.add({ formId, app, version, name, questionGroup });
};

export const saveAnswerToDB = ({ formId, answer }) => {
  db.answers.clear();
  db.answers.add({ formId, answer });
};

export const getAnswerFromDB = ({ formId }) => db.table("answers").get(formId);

export default db;
