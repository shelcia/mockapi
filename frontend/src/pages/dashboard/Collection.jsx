import React, { useEffect, useState } from "react";
import {
  Button,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Link,
  Grid,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";
// import { VscGraph } from "react-icons/vsc";
import { BACKEND_URL } from "../../services/api";
import { toast } from "react-hot-toast";
import { blue } from "@mui/material/colors";
import { FiEye, FiEdit2, FiTrash } from "react-icons/fi";
import { FaRegClone } from "react-icons/fa";
import { apiResource } from "../../services/models/resourceModal";
import { apiUser } from "../../services/models/userModal";
import { apiProject } from "../../services/models/projectModel";
import ResourceModal from "./components/ResourceModal";
import EndpointModal from "./components/EndpointModal";
import EditResourceModal from "./components/EditResourceModal";
import ResultModal from "./components/ResultModal";
import ViewAnalytics from "./components/ViewAnalytics";
import CloneModal from "./components/CloneModal";
import { CustomTooltip } from "../../components/CustomTooltip";
import DeleteResourceModal from "./components/DeleteResourceModal";
import CustomCheckbox from "../../components/CustomCheckbox";
import { CopyButton } from "../../components/CustomButtons";
import { copyTextToClipboard } from "../../utils/utils";

const Collection = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [resources, setResources] = useState([]);

  const [checkedList, setCheckedList] = useState([]);

  const [isCopied, setIsCopied] = useState(false);

  const navigate = useNavigate();

  const { projectId } = useParams();

  const fetchResource = () => {
    apiResource.getSingle(`project/${projectId}`).then((res) => {
      if (res.status === "200") {
        setResources(res.message);
      }
    });
    apiProject.getSingle(`single/${projectId}`).then((res) => {
      if (res.status === "200") {
        // console.log(res.message.name);
        setProjectName(res.message?.name);
      }
    });
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchResource(ac.signal);
    return () => ac.abort();
  }, []);

  const delResource = (id) => {
    if (!id) {
      return;
    }
    toast("Deleting ...");
    apiResource.remove(id).then((res) => {
      // console.log(res);
      if (res.status === "200") {
        fetchResource();
      } else {
        toast.error("Error");
      }
    });
  };

  const handleChecked = (e, id) => {
    let newCheckList = e.target.checked
      ? [...checkedList, id]
      : checkedList.filter((_id) => _id != id);

    setCheckedList(newCheckList);
  };

  const delSelected = () => {
    const body = {
      resources: checkedList,
    };
    toast.promise(
      new Promise((resolve, reject) => {
        apiResource.removeAll(body).then((res) => {
          if (res.status === "200") {
            fetchResource();
            setCheckedList([]);
            resolve(res.message);
          }
          reject(res.message);
        });
      }),
      {
        loading: "Deleting",
        success: (message) => message,
        error: (err) => err,
      }
    );
  };

  const handleCopyClick = (data) => {
    copyTextToClipboard(data)
      .then(() => {
        setIsCopied(true);
        toast.success("Copied !");
        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Couldn't copy !");
      });
  };

  return (
    <React.Fragment>
      <Button onClick={() => navigate(-1)}>
        <MdArrowBackIosNew />
        Back
      </Button>
      <CardContent>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          {projectName}
        </Typography>
        <Alert sx={{ mb: 2 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>API endpoint</AlertTitle>

          <code>{`${BACKEND_URL}/resource/:endpoint`}</code>
        //  this above code might work
          <CopyButton
            sx={{ ml: 1 }}
            disabled={isCopied ? true : false}
            onClick={() => {
              handleCopyClick(`${BACKEND_URL}/resource/:endpoint`);
            }}
          >
            {isCopied ? "Done" : "Copy"}
          </CopyButton>
        </Alert>
        <Typography component="p" variant="h6" sx={{ mb: 2 }}>
          <Link
            href="https://documenter.getpostman.com/view/21272376/2s8YmUMLP2#f02f8b5d-1988-4177-816a-6da7fcb47d88"
            target="_blank"
          >
            Test Postman Documentation
          </Link>
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          New Resource
        </Button>
        <List sx={{ overflowX: "auto" }}>
          {resources?.map((resource) => (
            <Stack direction={"row"} key={resource._id}>
              <CustomCheckbox handleChecked={handleChecked} id={resource._id} />
              <Resource
                resource={resource}
                fetchResource={fetchResource}
                delResource={delResource}
              />
            </Stack>
          ))}
        </List>
        {checkedList.length !== 0 && (
          <Button
            onClick={() => {
              delSelected();
            }}
            variant="contained"
            color="error"
          >
            Delete selected
          </Button>
        )}
      </CardContent>
      <ResourceModal
        open={open}
        setOpen={setOpen}
        fetchResource={fetchResource}
        loading={loading}
        setLoading={setLoading}
      />
    </React.Fragment>
  );
};

export default Collection;

const Resource = ({ resource, fetchResource, delResource }) => {
  const [loading, setloading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [endModal, setEndModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(false);
  const [cloneModal, setCloneModal] = useState(false);
  const [delResourceModal, setDelResourceModal] = useState(false);

  const [result, setResult] = useState([]);

  const fetchResult = (signal) => {
    setloading(true);
    apiUser.getSingle(resource._id, signal).then((res) => {
      if (res.status === "200") {
        setResult(res.message);
        setloading(false);
      } else {
        setloading(false);
      }
    });
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchResult(ac.signal);
    return () => ac.abort();
  }, []);

  return (
    <React.Fragment>
      <ListItem>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex" }}
            alignItems="center"
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: blue[500] }}>
                {resource?.name?.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <Typography
              sx={{ display: "inline", mt: 1 }}
              component="h1"
              variant="h6"
              color="text.primary"
            >
              {resource?.name}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack
              spacing={2}
              direction="row"
              sx={{ justifyContent: { sm: "left", md: "right" } }}
            >
              <CustomTooltip title="View generated JSON data" arrow>
                <Button variant="contained" onClick={() => setOpenModal(true)}>
                  <FiEye />
                </Button>
              </CustomTooltip>
              <CustomTooltip title="Edit Resource" arrow>
                <Button variant="outlined" onClick={() => setEditModal(true)}>
                  <FiEdit2 />
                </Button>
              </CustomTooltip>
              {/* <Button
                variant="outlined"
                color="success"
                onClick={() => setAnalyticsModal(true)}
              >
                <VscGraph />
              </Button> */}
              <CustomTooltip title="Clone Resource" arrow>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setCloneModal(true)}
                >
                  <FaRegClone />
                </Button>
              </CustomTooltip>
              <CustomTooltip title="Delete Resource" arrow>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setDelResourceModal(true)}
                >
                  <FiTrash />
                </Button>
              </CustomTooltip>
              <CustomTooltip title="View generated API endpoints" arrow>
                <Button variant="contained" onClick={() => setEndModal(true)}>
                  View Endpoints
                </Button>
              </CustomTooltip>
            </Stack>
          </Grid>
        </Grid>
      </ListItem>
      <ResultModal
        open={openModal}
        setOpen={setOpenModal}
        result={result}
        loading={loading}
      />
      <EndpointModal
        open={endModal}
        setOpen={setEndModal}
        result={resource._id}
      />
      <EditResourceModal
        open={editModal}
        setOpen={setEditModal}
        result={resource._id}
        fetchResult={fetchResult}
      />
      <ViewAnalytics
        open={analyticsModal}
        setOpen={setAnalyticsModal}
        result={resource._id}
        fetchResult={fetchResult}
      />
      <CloneModal
        open={cloneModal}
        setOpen={setCloneModal}
        result={resource._id}
        fetchResources={fetchResource}
      />
      <DeleteResourceModal
        open={delResourceModal}
        setOpen={setDelResourceModal}
        result={resource._id}
        delResource={delResource}
      />
    </React.Fragment>
  );
};
