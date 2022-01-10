import Dexie from "dexie";

const db = new Dexie("akvo");
db.version(1).stores({
  forms: "formId, app, version, name",
  questionGroup: "++id, formId, version, active, repeat",
  question:
    "id, order, formId, questionGroupId, localeNameFlag, mandatory, active",
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

export const initForm = ({ formId, app, version, name, questionGroup }) => {
  db.forms.clear();
  db.questionGroup.clear();
  db.question.clear();
  db.forms.add({ formId, app, version, name });
  db.questionGroup.bulkAdd(
    questionGroup.map((x, xi) =>
      Object.keys(x).reduce(
        (o, k) => {
          if (k !== "question") {
            o[k] = o[k];
          }
          return o;
        },
        {
          id: xi,
          formId: formId,
          version: version,
          active: xi === 0,
          repeat: 1,
        }
      )
    )
  );
  const question = questionGroup
    .map((x, xi) => x.question.map((q) => ({ questionGroupId: xi, ...q })))
    .flatMap((x) => x);
  db.question.bulkAdd(question);
};

export default db;
