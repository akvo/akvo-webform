import React, { useState } from "react";
import { Drawer, Select } from "antd";
import moment from "moment";

const DrawerToggle = ({ setVisible, visible }) => {
  return (
    <div
      className={`submissions-drawer-toggle${visible ? "-close" : ""}`}
      onClick={() => setVisible(!visible)}
    ></div>
  );
};

const SubmissionListDrawer = ({ submissionList }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <DrawerToggle setVisible={setVisible} visible={visible} />
      <Drawer
        className="submissions-drawer-container"
        title="Submissions"
        placement="left"
        visible={visible}
        onClose={() => setVisible(!visible)}
      >
        <DrawerToggle setVisible={setVisible} visible={visible} />
        <Select
          showSearch
          placeholder="Select Submission"
          className="submission-list-select"
          options={submissionList.map((q) => ({
            label: `${q?.formName} - ${moment(q?.submissionStart).format(
              "MMMM Do YYYY"
            )}`,
            value: q?.cacheId,
          }))}
          optionFilterProp="label"
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={(cache) => {
            const findSubmission = submissionList.find(
              (s) => s.cacheId === cache
            );
            const { formId, cacheId } = findSubmission;
            const link = `${window.location.origin}/${formId}/${cacheId}`;
            window.location.replace(link);
          }}
        />
      </Drawer>
    </>
  );
};

export default SubmissionListDrawer;
