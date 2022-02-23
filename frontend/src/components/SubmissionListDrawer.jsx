import React, { useState, useMemo } from "react";
import { Drawer, Space, Table, Button } from "antd";
import { deleteAnswerByIdFromDB } from "../lib/db";
import { useParams } from "react-router-dom";
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
  const cacheIdURL = useParams()?.cacheId;
  const [visible, setVisible] = useState(false);

  const columns = [
    {
      title: "Questionnaire",
      dataIndex: "surveyGroupName",
      key: "surveyGroupName",
      elipsis: true,
      width: "108px",
      render: (text, record) => `${text} - ${record?.formName}`,
    },
    {
      title: "Data Point Name",
      dataIndex: "dataPointName",
      key: "dataPointName",
      elipsis: true,
    },
    {
      title: "Submission Start",
      dataIndex: "submissionStart",
      key: "submissionStart",
      elipsis: true,
      render: (text) => moment(text).format("MMMM Do YYYY"),
    },
    {
      title: "Action",
      key: "action",
      elipsis: true,
      fixed: "right",
      width: "128px",
      render: (record) => {
        const { formId, cacheId } = record;
        const origin = window.location.origin;
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              ghost
              onClick={() =>
                window.location.replace(`${origin}/${formId}/${cacheId}`)
              }
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
                    deleteAnswerByIdFromDB(cacheId).then(() => {
                      fetchSubmissionList();
                      // reload page if user delete loaded submission
                      if (cacheIdURL === cacheId) {
                        window.location.replace(`${origin}/${formId}`);
                      }
                      setNotification({ isVisible: false });
                    });
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
          scroll={{ y: "85vh", x: "525px", scrollToFirstRowOnChange: true }}
          loading={dataSource?.length === 0}
          size="small"
        />
      </Drawer>
    </>
  );
};

export default SubmissionListDrawer;
