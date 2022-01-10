import Dexie from "dexie";

const db = new Dexie("akvo");
db.version(1).stores({
  forms: "formId, app, version, name",
  questionGroups:
    "++questionGroupId, formId, text, altText, repeatable, active, current",
  questions: "id, questionGroupId, text, altText, type, dependency",
});

export default db;
