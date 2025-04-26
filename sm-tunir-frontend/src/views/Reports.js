import React,{useEffect,useState} from 'react'
import { Button, Row, Col, FormGroup, Form, FormInput, Container, Card,CardHeader, FormSelect, Nav, NavItem, NavLink } from 'shards-react'
import PageTitle from '../components/common/PageTitle'
import { useTranslation } from "react-i18next";
import api from '../api/api';

const Reports = () => {

    const [listFields,setListFields] = useState([])
    const [selectedField,setSelectedField] = useState('')
    const [selectedRange,setSelectedRange] = useState('')
    const [listReports,setListReports] = useState([])
    const [filename,setFileName] = useState('')
    const { t, i18n } = useTranslation();
    const [users,setUsers] = useState([])
    const [farms,setFarms] = useState([])
    const [fields,setFields] = useState([])
    const [reports,setReports] = useState([])

    let role = JSON.parse(localStorage.getItem('user')).role

    useEffect(()=>{

            const getListFields = async () => {
        try {
              await api.get('/field/fields')
              .then(response=>{
                    let fields = [] 
                    let reports = []
                      let result = response.data.farms
                    if(result) {
                        result.map(farms=> {
                            let fieldData = farms.fields 
                                if(fieldData){
                                    fieldData.map(field=>{
                                        fields.push({
                                            id : field.id,
                                            name : field.name,
                                        })
                                       let reportsData = field.reports
                                        if(reportsData){
                                            reportsData.map(item=>{
                                                reports.push({
                                                    id : item.id,
                                                    fieldId : item.field_id,
                                                    file : item.filename
                                                })
                                            })
                                        }
                                    })
                                }
                        })                       
                        setListReports(reports)
                        setListFields(fields)
                        console.log(fields.length)
                        if(fields.length > 0){
                            setSelectedField(fields[0].id)    

                        }
                    }
              }).catch(err=>{
                    console.log(err)
              })
        } catch (error) {
            console.log(error)
        }
                }
                const getMyUsers = async () => {
                    await api.get('/supplier/get-users')
                    .then(response =>{
                        let usersList = response.data.users
                        setUsers(usersList)
                        let Fields = []
                        let Reports = []
                        if(usersList.length > 0){
                          usersList.map(data=>{
                            let farmsList =  data.farms
                            if(farmsList.length > 0){
                              setFarms(farmsList)
                                farmsList.map(farm=>{
                                  let fieldsList = farm.fields
                                      if(fieldsList.length > 0){
                                        fieldsList.map(field=>{
                                          Fields.push({
                                            id : field.id,
                                            uid:field.uid,
                                            farmId :field.farm_id,
                                            name : field.name,
                                            Latitude: field.Latitude,
                                            Longitude: field.Longitude,
                                            status :field.status
                                          })
                                          let reportsList = field.reports
                                          if(reportsList.length > 0){
                                            reportsList.map(sensor=>{
                                              Reports.push({
                                                fieldId: sensor.field_id,
                                                filename: sensor.filename,
                                                userId: sensor.user_id
                                              })
                                            })
                                          }
                                        })
                                      }
              
                                })
                            }
                            
                          })
                          setFields(Fields)
                          setReports(Reports)
              
                        }
                    }).catch(err =>{
                        console.log(err)
                    })
                } 
            getMyUsers()
            getListFields()
        },[])
        console.log(reports)
        console.log(fields)
        const selectSearch = [
            { value: 'week', label: 'Last week' },
            { value: 'custom', label: 'Custom Range' },
        ];

        const handleClick = async (file) => {
            try {
                let data = { filename: file };
                const response = await api.post('/report/download', data, { responseType: 'blob' });
        
                // Check if the response is a valid Blob
                if (!(response.data instanceof Blob)) {
                    console.error('Invalid response data. Expected Blob.');
                    return;
                }
        
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'historique.pdf';
                document.body.appendChild(a);
                a.click();
            } catch (error) {
                console.error('Error downloading report:', error);
            }
        };
        
const filterReport = listReports.filter(report=>{
    if(selectedField !== ""){
        return selectedField == report.fieldId
    }
})

const filterAllReports = reports.filter(report=>{
    if(selectedField !== ""){
        return selectedField == report.fieldId
    }
})

    return (
        <Container fluid className="main-content-container p-4">
            <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title='Reports'
                    subtitle={t('overview')}
                    className="text-sm-left"
                />
            </Row>
                <Row>
                    <Col lg='4' md="12" sm="12">
                        <FormGroup>
                            <label htmlFor="">Fields</label>
                            <FormSelect value={selectedField} onChange={(e) => setSelectedField(e.target.value)} >
                                <option value="">Select Field</option>
                                    {
                                        listFields.map(field=>(
                                            <option value={field.id}>{field.name}</option>
                                        ))
                                    }
                            </FormSelect>

                        </FormGroup>   
                    </Col>
                    {
                            role === "ROLE_SUPPLIER"
                            ?
                                <Col lg='4' md="12" sm="12">
                                    <FormGroup>
                                        <label htmlFor="">Clients Fields</label>
                                        <FormSelect value={selectedField} onChange={(e) => setSelectedField(e.target.value)} >
                                            <option value="">Select Field</option>
                                                {
                                                    fields.map(field=>(
                                                        <option value={field.id}>{field.name}</option>
                                                    ))
                                                }
                                        </FormSelect>

                                    </FormGroup>   
                                </Col>
                            :
                            null
                        }
                    <Col lg='4' md="12" sm="12">
                     
                                <FormGroup>
                                    <label htmlFor="">Report Period</label>
                                    <FormSelect value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)} >
                                        <option value="">Select Period</option>
                                        {
                                            selectSearch.map(({ value, label }) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))
                                        }
                                    </FormSelect>

                                </FormGroup>
                                {
                                    selectedRange === "custom"
                                    ?
                                        <FormGroup >
                                            <p style={{ margin: "0px" }}>{t('start_date')}</p>
                                            <FormInput
                                                type="datetime-local"
                                                placeholder="Start Date"

                                            />
                                            <p style={{ margin: "0px" }}>{t('end_date')}</p>
                                            <FormInput
                                                type="datetime-local"
                                                placeholder="End Date"

                                            />
                                        </FormGroup>
                                    :
                                    null
                                }
                    </Col>
                            
                </Row>
            <Card>
                <CardHeader className="border-bottom">
                        <p>My Reports</p>

                </CardHeader>
                <Row className="p-2 m-2">

                    <Col lg='6' md='12' sm='12'>
                       
                        <div className='py-4'>
                        {
                            filterReport.map(report=>{
                               return (
                                <div className='d-flex justify-content-between align-items-center m-1' style={{border:"1px solid #eee",borderRadius:12,padding:5}}>
                                    <h6>► Field Report {report.file.slice(37,58)}</h6>
                                    <button style={{background:"none",border:"none",outline:"none",padding:8 ,margin:5}} onClick={() => handleClick(report.file)}> <i className='material-icons' style={{fontSize:"28px",color:"#27A6B9"}}>&#xf000;</i> </button>

                                </div>
                               )
                            
                            })
                        }

                        </div>
                    </Col> 
                    {
                            role === "ROLE_SUPPLIER"
                            ?
                                <Col lg='6' md='12' sm='12' className='border-left'>
                                <p>Clients Reports</p>
                                
                                    <div className='py-4'>
                                    {
                                        filterAllReports.map(report=>{
                                            let userName = ""
                                            users.map(user=>{
                                                if(user.id === report.userId){
                                                    userName = user.name
                                                }
                                            })
                                        return (
                                            <div className='d-flex justify-content-between align-items-center m-1' style={{border:"1px solid #eee",borderRadius:12,padding:5}}>
                                                <h6>► {userName} Field Report {report.filename.slice(37,58)}</h6>
                                                <button style={{background:"none",border:"none",outline:"none",padding:8 ,margin:5}} onClick={() => handleClick(report.filename)}> <i className='material-icons' style={{fontSize:"28px"}}>&#xf000;</i> </button>

                                            </div>
                                        )
                                        
                                        })
                                    }

                                    </div>
                                </Col>
                            :
                            null
                    } 
                </Row>
            </Card>
        </Container>
    )
}

export default Reports