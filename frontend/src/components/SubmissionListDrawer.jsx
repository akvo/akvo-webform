import React, { useState, useMemo } from "react";
import { Drawer, Space, Table, Button } from "antd";
import { deleteAnswerByIdFromDB } from "../lib/db";
import moment from "moment";

const DrawerToggle = ({ setVisible, visible }) => {
  return (
    <div
      className={`submissions-drawer-toggle${visible ? "-close" : ""}`}
      onClick={() => setVisible(!visible)}
    ></div>
  );
};

const SubmissionListDrawer = ({
  submissionList,
  fetchSubmissionList,
  setNotification,
}) => {
  const [visible, setVisible] = useState(false);

  const columns = [
    {
      title: "Questionnaire",
      dataIndex: "surveyGroupName",
      key: "surveyGroupName",
      render: (text, record) => `${text} - ${record?.formName}`,
    },
    {
      title: "Submission Start",
      dataIndex: "submissionStart",
      key: "submissionStart",
      render: (text) => moment(text).format("MMMM Do YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (record) => {
        const { formId, cacheId } = record;
        const link = `${window.location.origin}/${formId}/${cacheId}`;
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              ghost
              onClick={() => window.location.replace(link)}
            >
              Load
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                setNotification({
                  isVisible: true,
                  type: "delete-saved-submission",
                  onCancel: () => setNotification({ isVisible: false }),
                  onOk: () => {
                    deleteAnswerByIdFromDB(cacheId);
                    fetchSubmissionList();
                    setNotification({ isVisible: false });
                  },
                });
              }}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  const dataSource = useMemo(() => {
    return submissionList.map((s, si) => ({
      key: si + 1,
      ...s,
    }));
  }, [submissionList]);

  return (
    <>
      <DrawerToggle setVisible={setVisible} visible={visible} />
      <Drawer
        className="submissions-drawer-container"
        title="Submissions"
        placement="left"
        width="450"
        visible={visible}
        onClose={() => setVisible(!visible)}
      >
        <DrawerToggle setVisible={setVisible} visible={visible} />
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: "600" }}
          loading={dataSource?.length === 0}
          size="small"
        />
      </Drawer>
    </>
  );
};

export default SubmissionListDrawer;
