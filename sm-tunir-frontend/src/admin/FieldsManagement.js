import React, { useState, useEffect } from 'react'
import api from '../api/api'
import { Container, Row, Col, Card } from 'react-bootstrap'
import PageTitle from '../components/common/PageTitle'
import { useTranslation } from 'react-i18next';
import { Modal } from "react-bootstrap";
import swal from 'sweetalert';

import { Button, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Recommend } from '@mui/icons-material';
import SmsIcon from '@mui/icons-material/Sms';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HistoryIcon from '@mui/icons-material/History';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';
import CalculateIcon from '@mui/icons-material/Calculate';
import AddIcon from '@mui/icons-material/Add';
import Pagination from '../views/Pagination';
import { useNavigate } from 'react-router';

import Swal from 'sweetalert2';
const FieldsManagement = () => {
  const { t, i18n } = useTranslation();
  const [fieldsPerPage, setFieldsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1);
  const [fields, setFields] = useState([])
  const [farms, setFarms] = useState([])
  const [sensors, setSensors] = useState([])
  const [users, setUsers] = useState([])
  const [singleField, setSingleField] = useState({})
  const [reports, setReports] = useState([])
  const [show, setShow] = useState(false);
  const [showRecomnd, setShowRecomnd] = useState(false);
  const [clicked, setClicked] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [calculData, setCalculData] = useState(null)
  const [searchTerm, setSearchTerm] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleShowRecomnd = () => setShowRecomnd(true);
  const handleCloseRecomnd = () => setShowRecomnd(false);
  const getFields = async () => {
    await api('/admin/fields')
      .then(response => {
        let fieldsData = response.data.fields
        let farmsData = response.data.farms
        let sensorsData = response.data.sensors
        let usersData = response.data.users

        setFields(fieldsData)
        setFarms(farmsData)
        setSensors(sensorsData)
        setUsers(usersData)
      }).catch(error => {
        console.log(error)
      })
  }

  const generateReport = async () => {
    setIsGenerated(true)
    await api.get('/createBulletin')
      .then(result => {
        if (result) {
          swal({
            icon: "success",
          });
          setIsGenerated(false)

        }
      }).catch(error => {
        console.log(error)
      })
  }

  const getSingleField = async (fieldId) => {
    await api.post('/admin/fields/single-field', { fieldId })
      .then(response => {
        if (response.data.type === "success") {
          let fieldData = response.data.field
          setSingleField(fieldData)
          let allReports = fieldData.reports
          setReports(allReports)
          handleShow(true)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
  const [recommendations, setRecmnd] = useState([])
  const [message, setMessage] = useState("")
  const [userId, setUserId] = useState('')
  const getSingleFieldRecmnds = async (fieldId, userId) => {
    await api.get(`/recommendations/${userId}/${fieldId}`)
      .then(response => {
        let recommendations = response.data.recommendations
        setRecmnd(recommendations)
        setMessage(recommendations[0].message)
        setUserId(recommendations[0].user_id)
        handleShowRecomnd(true)

      }).catch(err => {
        console.log(err)
      })
  }


  const calculSimulation = async (fieldId, userId) => {
    try {
      const response = await api.post('/admin/field-sensor-calcul', { fieldId, userId });
      const data = await response.data.data;
      const feedback = response.data.feedback || [];
      if (data && data.length > 0) {

        navigate(`/admin/calcul-fields/${fieldId}`, {
          state: {
            calculData: data
          }
        })
      } else {
      // No data – show detailed feedback to user
      if (feedback.length > 0) {
        const reasons = feedback.flatMap(f => f.reasons || []);
        const uniqueReasons = [...new Set(reasons)]; // Remove duplicates

        await Swal.fire({
          icon: 'info',
          title: 'Aucune simulation effectuée',
          html: `
            <p>Les raisons possibles :</p>
            <ul style="text-align:left;">
              ${uniqueReasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
          `
        });
      } else {
        await Swal.fire({
          icon: 'info',
          title: 'Aucune simulation effectuée',
          text: 'Aucune donnée valide n’a été trouvée pour ce champ.'
        });
      }

      setCalculData([]);
    }

    } catch (error) {
     console.error(error);
    await Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Une erreur est survenue lors du calcul.'
    });
    }

  }

  useEffect(() => {
    getFields()
  }, [])

  const handleClick = async (file) => {

    try {
      let data = { filename: file }
      const response = await api.post('/report/download', data);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historique.pdf';
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error(error);
    }
  };
  const downloadLastReport = async (file) => {

    try {
      let data = { filename: file }
      const response = await api.post('/report/download', data);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historique.pdf';
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error(error);
    }
  };

  const navigate = useNavigate()
  const goToField = (uid, userId) => {
    if (uid) {
      localStorage.setItem(
        "Field",
        uid
      );
    } else {
      localStorage.setItem("Field", 0);
    }
    navigate(`/Fields/${uid}`)
  }
  const goToHistory = (code) => {

    navigate(`/my-history/${code}`)
  }

  const getUserName = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.name : '-';
  };
  const getUserPhone = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.phone_number : '-';
  };


  const sendSMSToUser = (phone) => {
    const data = {
      phoneNumber: phone,
      message: message
    }

    try {
      if (message && message !== "") {
        api.post('/admin/send-sms', data)
          .then(response => {
            if (response.data.type === "success") {
              swal({
                icon: "success",
              });

            }

          }).catch(error => {
            console.log(error)
          })

      }
    } catch (error) {
      console.log(error)
    }

  }

  const sendToUser = async (reportId, userId) => {
    try {
      const response = await api.post(`/admin/send-report-email`, { reportId, userId });
      if (response.data.type === "success") {
        swal({
          icon: "success",
          text: "Report Successfully sended",
        });

      }
    } catch (error) {
      swal({
        icon: "error",
        text: "Error",
      });

    }
  }
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const filteredFields = fields.filter((field) => {
    const farm = farms.find(f => f.id === field.farm_id);
    const farmName = farm ? farm.name.toLowerCase() : "";
    const fieldName = field.name?.toLowerCase() || "";

    return (
      farmName.includes(searchTerm.toLowerCase()) ||
      fieldName.includes(searchTerm.toLowerCase())
    );
  });

  const sortedFields = filteredFields.sort((a, b) => a.name.localeCompare(b.name));

  const indexOfLastPost = currentPage * fieldsPerPage;
  const indexOfFirstPost = indexOfLastPost - fieldsPerPage;
  const currentFields = sortedFields.slice(indexOfFirstPost, indexOfLastPost);





  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <>
      <Container className="p-4">
        <Row noGutters className="page-header py-4">
          <PageTitle
            sm="4"
            title={t('list_fields')}
            subtitle={t('list_fields')}
            className="text-sm-left"
          />
        </Row>
        <Row className="mb-3 gap-2 d-flex justify-content-between align-items-center w-100">
          <Col lg="6" md="12">
            <input
              type="text"
              className="form-control"
              placeholder="Search by farm or field..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </Col>
          <Col lg="5" md="12">
            <div className='d-flex justify-content-end'>
              <Button size="small" variant="contained" disabled={isGenerated} onClick={() => generateReport()} endIcon={<AddIcon />}> Generate Reports</Button>
            </div>
          </Col>
        </Row>

        <Card style={{ overflowX: "auto" }}>
          <table className="table mb-0 text-center table-responsive-lg table-hover table-bordered">
            <thead className="bg-light">
              <tr>
                <th scope="col" className="border-0">{t('user')}</th>

                <th scope="col" className="border-0">{t('farms')}</th>
                <th scope="col" className="border-0">{t('fields')}</th>

                <th scope="col" className="border-0">{t('crop_type')}</th>
                <th scope="col" className="border-0">{t('crop_variety')}</th>
                <th scope="col" className="border-0">{t('sensor_code')}</th>
                <th scope="col" className="border-0">{t('list_fields')}</th>
                <th scope="col" className="border-0">{t('History')}</th>
                <th scope="col" className="border-0">{t('Reports')}</th>
                <th scope="col" className="border-0">{t('Recommandations')}</th>
                <th scope="col" className="border-0">{t('Water Balance Simulation')}</th>


              </tr>
            </thead>
            <tbody>
              {

                currentFields.map(field => {
                  let croptype = "-"
                  let variety = "-"
                  let farmName = "-"
                  let sensorCode = "-"
                  let userId = ""

                  let crops = field.crops
                  crops.forEach(crop => (
                    croptype = crop.croptypes.crop
                  ))
                  crops.forEach(crop => {
                    if (crop.varieties && Object.keys(crop.varieties).length !== 0) {
                      variety = crop.varieties.crop_variety

                    }
                  })
                  farms && farms.map(farm => {
                    if (farm.id === field.farm_id) {
                      farmName = farm.name
                      userId = farm.user_id;
                    }

                  })

                  sensors && sensors.map(sensor => {
                    if (sensor.field_id === field.id) {
                      sensorCode = sensor.code
                    }
                  })
                  // const farm = farms.find((farm) => farm.id === field.farm_id);
                  // console.log(farm)
                  // if (farm) {
                  //   farmName = farm.name;
                  // }
                  return (
                    <tr key={field.id}>
                      <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{getUserName(userId)}</td>
                      <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{farmName}</td>
                      <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{field.name}</td>
                      <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{croptype}</td>
                      <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{variety}</td>
                      <td style={{ fontSize: 11.5, fontWeight: 'bold' }}>{sensorCode}</td>

                      {/* <td><Button outline onClick={() => downloadLastReport()}><i className='material-icons'>&#xf090;</i></Button></td> */}
                      <td>
                        <IconButton onClick={() => goToField(field.uid)}><PreviewIcon /></IconButton>

                      </td>
                      <td>
                        <IconButton onClick={() => goToHistory(sensorCode)}><HistoryIcon /></IconButton>

                      </td>
                      <td>

                        <IconButton onClick={() => getSingleField(field.id)}><SummarizeIcon /></IconButton>

                      </td>
                      <td>

                        <IconButton onClick={() => getSingleFieldRecmnds(field.id, userId)}><SmsIcon /></IconButton>

                      </td>
                      <td>

                        <IconButton onClick={() => calculSimulation(field.id)}><CalculateIcon /></IconButton>

                      </td>
                    </tr>
                  )
                })
              }

            </tbody>
          </table>

        </Card>
        <Row className=" py-2 justify-content-center">
          <Pagination usersPerPage={fieldsPerPage} totalUsers={filteredFields.length} paginate={paginate} />

        </Row>
      </Container>
      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header className="d-flex flex-column" >
          <Modal.Title> <h5>Field :{singleField.name}</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table mb-0 text-center table-responsive-lg table-bordered">
            <thead className="bg-light">
              <tr>
                <th scope="col" className="border-0">{t('Date')}</th>
                <th scope="col" className="border-0">{t('Download')}</th>
                <th scope="col" className="border-0">{t('Send')}</th>


              </tr>
            </thead>
            <tbody>

              {

                reports.map(report => {

                  return (
                    <tr key={report.id}>

                      <td> {t('from')} {report.filename.slice(37, 47)} {t('to')} {report.filename.slice(48, 58)} </td>
                      <td>
                        <IconButton onClick={() => handleClick(report.filename)}><DownloadIcon /></IconButton>
                      </td>
                      <td>
                        <IconButton onClick={() => sendToUser(report.id, report.user_id)}><SendIcon /></IconButton>

                      </td>

                    </tr>
                  )
                })
              }

            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>

        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={showRecomnd} onHide={handleClose}>
        <Modal.Header className="d-flex flex-column" >
          <Modal.Title> <h5>Recommendations</h5></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ border: "1px solid #bbb", padding: 6, margin: 8 }}>
            <h4 className='text-center'>{t('title_recomnd')}</h4>
            <p className='text-center'>{t('nb_recomnd')} </p>
            <div className="d-flex justify-content-center align-items-center flex-column">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} name="" id="" cols="50" rows="5" style={{ outline: "none", border: "1px solid lightgray", borderRadius: 12, padding: 8, margin: 8 }}> </textarea>
              <Button className="my-2" outline onClick={() => { sendSMSToUser(getUserPhone(userId)) }}><i className='material-icons'>&#xe163;</i></Button>



            </div>

          </div>
          <Row className="d-flex justify-content-center align-items-center my-2">
            <Button onClick={() => setClicked(!clicked)}>{t('see_all')}</Button>

          </Row>
          {
            clicked
              ?
              <table className="table mb-0 text-center table-responsive-lg table-bordered">
                <thead className="bg-light">
                  <tr>
                    <th scope="col" className="border-0">{t('Date')}</th>
                    <th scope="col" className="border-0">{t('Message')}</th>
                    {/* <th scope="col" className="border-0">{t('Send SmS')}</th> */}


                  </tr>
                </thead>
                <tbody>

                  {

                    recommendations && recommendations.map(recomnd => {
                      return (
                        <tr key={recomnd.id}>
                          <td>
                            {new Date(recomnd.created_at).toISOString().slice(0, 10)}
                          </td>
                          <td>
                            <textarea readOnly style={{ outline: "none", border: "1px solid lightgray", borderRadius: 12, padding: 8, margin: 8 }} name="" id="" cols="40" rows="5" >
                              {recomnd.message}
                            </textarea>

                          </td>
                          {/* <td>
                              <Button outline onClick={() => { sendSMSToUser(getUserPhone(recomnd.user_id)) }}><i className='material-icons'>&#xe163;</i></Button>


                            </td> */}
                        </tr>
                      )

                    })
                  }

                </tbody>
              </table>
              :
              null
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRecomnd}>
            Close
          </Button>

        </Modal.Footer>
      </Modal>
    </>
  )
}

export default FieldsManagement