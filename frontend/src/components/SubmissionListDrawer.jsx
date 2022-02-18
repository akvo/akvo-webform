import React, { useState } from "react";
import { Drawer, Button } from "antd";

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

  console.log(submissionList);
  return (
    <>
      <DrawerToggle setVisible={setVisible} visible={visible} />
      <Drawer
        className="submissions-drawer-container"
        title="Submissions"
        placement="left"
        visible={visible}
        zIndex={10003}
      >
        <DrawerToggle setVisible={setVisible} visible={visible} />
        <p>Here submission list will render</p>
      </Drawer>
    </>
  );
};

export default SubmissionListDrawer;
