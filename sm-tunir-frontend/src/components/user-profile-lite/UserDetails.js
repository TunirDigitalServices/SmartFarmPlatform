import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  Button,
  ListGroup,
  ListGroupItem,
  ProgressBar
} from "react-bootstrap";
import api from '../../api/api'
import { useTranslation } from "react-i18next";

import img from "../../assets/images/avatars/default-avatar.png"

function UserDetails() {

  const [data, setData] = useState({ name: "", email: "", address: "", upload_file_name: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  const [msgServer, setMsgServer] = useState("")
  const [classMsg, setClassMsg] = useState("")
  const [displayMsg, setDisplayMsg] = useState("hide")
  const [iconMsg, setIconMsg] = useState("info")
  const { t, i18n } = useTranslation();

  const fileRef = useRef();

  const handleChange = async (e) => {
    const [file] = e.target.files;
    setSelectedFile(file)
    //Only .png, .jpg and .jpeg format allowed!
    //
  };
  const handleSubmitFile = async (e) => {
    const formData = new FormData();
    formData.append(
      "userPhoto",
      selectedFile,
      selectedFile.name
    );
    let $error = false;
    const maxSize = 1 * 1024 * 1024; // for 1MB
    if (selectedFile.size > maxSize) {
      $error = true;
      setMsgServer("ERROR - Max size 1MB")
      setClassMsg("danger")
      setDisplayMsg("show")
      setIconMsg("info")
      return false
    }
    if ((selectedFile.type == "image/png" || selectedFile.type == "image/jpg" || selectedFile.type == "image/jpeg") && $error == false) {
      await api.post('/upload-avatar', formData)
        .then(response => {
          if (response.data.type && response.data.type == "success") {
            let user = JSON.parse(localStorage.getItem("user"));
            user.avatar = `userPhoto-${user.id}.jpeg`;
            localStorage.setItem("user", JSON.stringify(user));


            setMsgServer(response.data.message)
            setClassMsg("success")
            setDisplayMsg("show")
            setIconMsg("check")
            window.location.reload();
          }
          if (response.data.type && response.data.type == "danger") {
            setMsgServer(response.data.message)
            setClassMsg("danger")
            setDisplayMsg("show")
            setIconMsg("info")
          }

        }).catch(() => {
          setMsgServer("ERROR - Upload file")
          setClassMsg("danger")
          setDisplayMsg("show")
          setIconMsg("info")
          return false
        });
    } else {
      setMsgServer("ERROR - Only .png, .jpg and .jpeg format allowed!")
      return false
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      await api.get('/profil').then(response => {
        const newData = response.data;
        setData(newData.result);
      });

    };
    fetchData();
  }, []);

  return (
    <Card small className="mb-4 pt-3">
      <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
        <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
      </div>
      <Card.Header className="border-bottom text-center">
        <div className="mb-3 mx-auto" style={{ height: "110px" }}>
          <img
            className="rounded-circle h-100"
            src={data.upload_file_name == null ? img : `${process.env.REACT_APP_BASE_URL}/static/${data.upload_file_name}`}
            alt={data.name}
            width="110"
          />
        </div>
        <h4 className="mb-0">{data.name}</h4>

        <Button pill variant="outline-primary" size="sm" className="mb-2 mt-2" onClick={() => fileRef.current.click()}>
          {t('avatar')}
        </Button>
        {selectedFile == null ? '' : <Button pill variant="outline-primary" size="sm" className="mb-2 success" onClick={handleSubmitFile}>{t('upload')}
          </Button>}

        <input
          ref={fileRef}
          onChange={handleChange}
          multiple={false}
          type="file"
          hidden
        />
      </Card.Header>
      <ListGroup flush>
        <ListGroupItem className="px-4">
          <div className="progress-wrapper">
            <strong className="text-muted d-block mb-2">
              {t('workload')}
            </strong>
            <div className="">
              <ProgressBar now={100} className="progress-sm" />
              <span className="progress-value">
                100%
              </span>
            </div>
          </div>
        </ListGroupItem>
        <ListGroupItem className="p-4">
          <strong className="text-muted d-block mb-2">
            Description
          </strong>
          <span>{data.description}
          </span>
        </ListGroupItem>
      </ListGroup>
    </Card>

  )

}
export default UserDetails