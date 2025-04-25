import React, { useEffect, useState } from 'react'
import { Container, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Row, Col, Form, FormGroup, FormInput, FormSelect, FormTextarea, ButtonGroup, Button, Progress, Modal, ModalHeader, ModalBody, BreadcrumbItem, Breadcrumb, Nav, NavItem, NavLink } from "shards-react";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link , useHistory , useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import countryState from '../data/gistfile.json'
import cartImg from '../images/pin.png'
import soil from '../images/soil.png'
import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';
import moment from 'moment';

const ConfigurationCrops = () => {

    const [cropsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1);

    const [SearchName, setSearchName] = useState('')


    const paginate = pageNumber => setCurrentPage(pageNumber);

    const { t, i18n } = useTranslation();
    const history = useHistory()

    const [kcByDays,setKcByDays] = useState([])

    const  [plantDateErr,setPlantDateErr] = useState('')

    const [allCrops,setAllCrops] = useState([])
    const [resultCalculKc,setResultCalculKc] = useState([])

    const [cropData,setCropData] = useState({
        crop : '',
        cropVariety : '',
        init : "",
        dev :"",
        mid :"",
        late :"",
        plantDate :"",
        rootMin : "",
        rootMax : "",
        kcInit :"",
        kcDev : "",
        kcMid :"",
        kcLate :"",
        allKcList : [],
        fractionRuPratique: "",
        cropAr : "",
        cropEn : "",
        cropPhoto :"",
        totalHours : "",
        minTemp: ""
    })

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState({});
  
   

    const [toggle ,setToggle] = useState(false)
    const [toggleEdit ,setToggleEdit] = useState(false)
    const [singleCrop ,setSingleCrop] = useState({})

    const getCrops = async () => {
            try {
                    await api.get('/crops/get-crops')
                    .then(response=>{
                        if(response.data.type === "success"){
                            let listCrops = response.data.Crops
                            setAllCrops(listCrops)

                        }
                    }).catch(error =>{
                        console.log(error)
                    })
                    
            } catch (error) {   
                console.log(error)
            }
    }
 
    useEffect(() => {
        getCrops()
    }, [])

    const getSingleCrop =  (cropId,title) => {

        let data = {
            crop_id: cropId,
        }

         api.post('/crops/get-crop', data)
            .then(res => {
                let dataCrops = res.data.crop
                let date = dataCrops.plant_date
                setSingleCrop(dataCrops)
                setCropData({crop : dataCrops.crop})
                setCropData({cropVariety: dataCrops.crop_variety})
                setCropData({fractionRuPratique: dataCrops.practical_fraction})
                setCropData({plantDate: date.slice(0,10)})
                setCropData({init : dataCrops.init})
                setCropData({dev: dataCrops.dev})
                setCropData({mid : dataCrops.mid})
                setCropData({late: dataCrops.late})
                setCropData({rootMin : dataCrops.root_min})
                setCropData({rootMax: dataCrops.root_max})
                setCropData({minTemp: dataCrops.temperature})
                setCropData({totalHours: dataCrops.hours})
                setCropData({kcInit : dataCrops.kc_init})
                setCropData({kcDev: dataCrops.kc_dev})
                setCropData({kcMid : dataCrops.kc_mid})
                setCropData({kcLate: dataCrops.kc_late})
                setCropData({allKcList : dataCrops.all_kc})
            }).catch(error => {
                console.log(error)

            })
            if(title === 'Edit'){
                setToggleEdit(!toggleEdit)

            }

    }
    const onFileChange = e => {
        setSelectedFile(e.target.files[0]);
      };
      const onFileUploadAdd = async () => {
        const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('crop', cropData.crop);

      try {
        const res = await api.post('/crop/upload-photo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        setUploadedFile(res.data);
      } catch (err) {
        console.error(err);
      }
    };

      const onFileUploadEdit = async () => {
          const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('crop', singleCrop.crop);
  
        try {
          const res = await api.post('/crop/upload-photo', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          setUploadedFile(res.data);
        } catch (err) {
          console.error(err);
        }
      };

    const isValidate = () => {
        let plantDateErr = ''
        if(!cropData.plantDate){
            plantDateErr = 'Please select a date !'
            setPlantDateErr(plantDateErr)
        }
        if(plantDateErr){
            setPlantDateErr(plantDateErr)
            return false
        }
        return true
    } 

    const addCrops = () => {
        let isValid = isValidate()
        let data = {
            crop : cropData.crop ,
            crop_variety :cropData.cropVariety,
            plant_date : cropData.plantDate,
            init : cropData.init,
            dev : cropData.dev,
            mid: cropData.mid,
            late : cropData.late,
            kc_init : cropData.kcInit,
            kc_dev : cropData.kcDev,
            kc_mid: cropData.kcMid,
            kc_late : cropData.kcLate,
            root_max : cropData.rootMax,
            root_min : cropData.rootMin,
            hours:cropData.totalHours,
            temperature:cropData.minTemp,
            all_kc : resultCalculKc,
            practical_fraction : cropData.fractionRuPratique,
            crop_ar :cropData.cropAr,
            crop_en:cropData.cropEn,
        }
            api.post('/crops/add-crops',data)
            .then(response=>{
                if(response && response.data.type === "success"){
                    swal(`${t('Crop Added')}`, { icon: "success" });
                    setToggle(false)
                    getCrops()
                }
                if(response && response.data.type === "danger"){
                    swal(`${t('Crop Added')}`, { icon: "error" });
                }
            }).catch(error=>{
                console.log(error)
            })

        
    }

    const handleEdit = (cropId) => {
        let isValid = isValidate()

        let data = {
            crop_id : cropId,
            crop : cropData.crop ,
            crop_variety :cropData.cropVariety,
            plant_date : cropData.plantDate,
            init : cropData.init,
            dev : cropData.dev,
            mid: cropData.mid,
            late : cropData.late,
            kc_init : cropData.kcInit,
            kc_dev : cropData.kcDev,
            kc_mid: cropData.kcMid,
            kc_late : cropData.kcLate,
            root_max : cropData.rootMax,
            root_min : cropData.rootMin,
            hours:cropData.totalHours,
            temperature:cropData.minTemp,
            all_kc : resultCalculKc,
            practical_fraction : cropData.fractionRuPratique

        }
    
        api.post('/crops/edit-crop', data)
          .then(response => {
            if (response.data.type == "success") {
              swal(" Crop has been updated", {
                icon: "success",
              });
              setToggleEdit(false)
              getCrops();
            }
            if (response.data.type && response.data.type == "danger") {
              swal({
                icon: 'error',
                title: 'Oops...',
                text: 'error_edit_crop'
              })
              return false;
            }
          }).catch(error => {
            swal({
              icon: 'error',
              title: 'Oops...',
              text: 'error_edit_crop'
            })
          })
          
      }
    console.log(cropData)

      const handleDelete = async cropId => {

    
        let data = {
            crop_id: cropId,
        }
        await api.delete('/crops/delete-crop', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: "Cannot Delete Crop",
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    getCrops();
                   
                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete Crop",
                    icon: "error",
                    text: 'error_delete_crop'
                    
                });
            })
        }
    
    const confirmDelete = cropId => {
    
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this crop!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(cropId)
                    swal(" Crop has been deleted!", {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete Crop",
                    icon: "error",
                    text: 'error_delete_crop'
    
                });
            })
    
    }  


    const filteredCrops = allCrops.filter(crops => {
        if (SearchName !== '') {
            return (
                crops.crop.toLowerCase().includes(SearchName.toLowerCase())
            )
        }
        
        return crops
    })

    const indexOfLastPost = currentPage * cropsPerPage;
    const indexOfFirstPost = indexOfLastPost - cropsPerPage;
    const currentCrops = filteredCrops.slice(indexOfFirstPost, indexOfLastPost);

            

    const handleKcByDays = () => {
        let DataCropKc = []
        if(cropData.init != "" && cropData.dev != "" && cropData.mid != "" && cropData.late != "" &&
         cropData.kcInit != "" && cropData.kcDev != "" && cropData.kcMid != "" && cropData.kcLate != ""
        
        ){
            DataCropKc = [
                { 
                    "period": cropData.init,
                    "kc" : cropData.kcInit
                },
                { 
                    "period": cropData.dev,
                    "kc" : cropData.kcDev
                },
                { 
                    "period": cropData.mid,
                    "kc" : cropData.kcMid
                },
                { 
                    "period": cropData.late,
                    "kc" : cropData.kcLate
                }]
        }
           
        
                
       setKcByDays(DataCropKc)
    }

    useEffect(()=>{
        handleKcByDays()
    },[cropData])

    const onChangeHandler = async (e,idx) => {
        console.log(e)
        //modifier le setResultCalculKc pour ensuite ajouter le resultCalculKc dans l'action save pour inserer un objet clé (1,2,3..) valeur (kc dans le tableau html) dans la base de données colonne kc par jour
        // setResultCalculKc(state => ([...state ,{['day'] : day ,  ['kc'] : value }]), [])
       let clone = [...cropData.allKcList];
        let obj = clone[idx];
        obj.kc = e.target.value;
        clone[idx] = obj;
        setResultCalculKc([...clone])
    }
    
    let KcResults = [];
    const tableConfigKc = (async) => {
        let periods = [];
        let KcValues = [];
        useEffect(()=>{
            setResultCalculKc(KcResults)
        },[kcByDays])
        if(kcByDays.length > 0){
            kcByDays.map(days=>{
                periods.push(days.period)
                KcValues.push(days.kc)
            })
            
            
        let elements = []
        let result = 0
        let arrayPeriod = periods
        let nextKc = 0
        let nextPeriod = 0
        let currentPeriod = 0 
        let j = 0
        let compteur = 1;
        let ligne = 0;
        let elment = {}
        let resultFormule =[];
        for (let i = 0; i < arrayPeriod.length; i++) {
            
            if(i==0){
                j=1 
            } 
            if(i>0){
                j=arrayPeriod[i-1]
                
            }

            if( i+1 in arrayPeriod === true){
                nextKc = KcValues[i+1]
                nextPeriod = arrayPeriod[i+1]
            }
            else {
                nextKc = 0
                nextPeriod = 0
            }
            currentPeriod=arrayPeriod[i]
        for (let n = 1 ; n <= currentPeriod ; n++){
            ligne = compteur++;

            if(nextKc > 0 && nextPeriod > 0){
                    result = (parseFloat((nextKc - KcValues[i]) / (nextPeriod) )  + parseFloat(KcValues[i]))
                    console.log(`${parseFloat(KcValues[i])}, ${nextKc},  ${nextPeriod}  , ${parseFloat(KcValues[i])}`)

            }else{
                result = parseFloat(KcValues[i]);
            }
            
            //@TODO ajouter le tableau dans setResultCalculKc
            elment = {
                "day": ligne,
                "kc": parseFloat(result).toFixed(1)
                 }
            //object result to save in database
            KcResults.push(elment)
            let dates = moment(cropData.plantDate).add(ligne - 1 , 'days').format("YYYY-MM-DD")
            elements.push(
                <tbody>
                    <tr>
                        <td>{ligne}</td>  
                        <td>{dates}</td> 
                        <td>
                            <input
                                     name={ligne}
                                     key={ligne}
                                    className='my-1'
                                    value={result}
                                    onChange={(e) => onChangeHandler(e.target.value , ligne)}
                            />    
                        </td> 
                    </tr>

                </tbody>
                );
        }   
        }
        return elements
    }
    }
    return (
        <>
        <Container className="p-4">
            <Row noGutters className="page-header py-4">
                <PageTitle
                    sm="4"
                    title={t('Crops Configuration')}
                    subtitle={t('Crops Configuration')}
                    className="text-sm-left"
                />
            </Row>
            <Row>
                    <PageTitle
                        sm="4"
                        subtitle={t('search')}
                        className="text-sm-left"
                    />
                </Row>
                <Row form className="d-flex justify-content-center">
                    <Col md="3" className="form-group">
                        <FormGroup>
                            <div className="d-flex">
                                <FormInput
                                    value={SearchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    id="search"
                                    placeholder="Search By Name " />

                            </div>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <PageTitle
                        sm="4"
                        subtitle={t('my actions')}
                        className="text-sm-left"
                    />
                </Row>
                <Row form className="py-2 d-flex justify-content-center">
                    <ButtonGroup>
                        <Button outline onClick={() => {setToggle(true)}}>Add Crop</Button>
                    </ButtonGroup>

                </Row>
                <Card>
                    <CardHeader className="border-bottom">
                        <div>
                            <h5>
                                Crops Info

                            </h5>

                        </div>
                    </CardHeader>
                    <CardBody>
                    <table className="table mb-0 text-center">
                        <thead className="bg-light">
                            <tr>
                                <th scope="col" className="border-0">{t('Crop')}</th>
                                <th scope="col" className="border-0">{t('Planting Date')}</th>
                                <th scope="col" className="border-0"></th>

                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentCrops.map(crop=>{
                                    let plantDate = moment(crop.plant_date).locale('En').format('MMM Do YYYY ')
                                    return(
                                        <tr>
                                            <td>{crop.crop}</td>
                                            <td>{plantDate}</td>


                                            <td>
                                               
                                                        <ButtonGroup size="sm" className="mr-2">
                                                            <Button title="Edit" onClick={() => {getSingleCrop(crop.id,'Edit')}} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                            <Button title="Delete" onClick={() => {confirmDelete(crop.id) }} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                                        </ButtonGroup>
                                                

                                            </td>
                                            
                                        </tr>

                                    )
                                })
                            }



                        </tbody>
                    </table>
                    </CardBody>
                </Card>
                <Row className="py-4 justify-content-center">
                    <Pagination usersPerPage={cropsPerPage} totalUsers={allCrops.length} paginate={paginate} />

                </Row>
        </Container>
        <Modal size='lg' centered={true} open={toggle}>
                        <ModalHeader className="d-flex justify-content-between align-items-center">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
        
                                }}
                            >
                                <Button
                                    // theme="success"
                                    onClick={()  => {addCrops()}}
                                    className="mb-2 mr-1 btn btn-success"
                                >
                                    <i class={`fa fa-check mx-2`}></i>
                                    {t('save')}
                                </Button>
                                <Button
                                    // theme="success"
                                    className="mb-2 mr-1 btn btn-danger"
                                    onClick={() => {setToggle(false)} }
                                >
                                    <i class={`fa fa-times mx-2`}></i>
                                    {t('cancel')}
                                </Button>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                        <Row>
                        <Col lg="7" md="12" sm="12" className="border-right" >

                            <CardBody>
                                <Row>
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Type</label>
                                            <FormInput
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={cropData.crop}
                                                onChange={e => setCropData({...cropData , crop : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>          
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Type (Ar)</label>
                                            <FormInput
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={cropData.cropAr}
                                                onChange={e => setCropData({...cropData , cropAr : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Type (En)</label>
                                            <FormInput
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={cropData.cropEn}
                                                onChange={e => setCropData({...cropData , cropEn : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    {/* <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Photo</label>
                                            <FormInput
                                                id='crop'
                                                type="file"
                                                placeholder="Crop Photo"
                                                // value={cropData.cropPhoto}
                                                onChange={onFileChange}
                                            />
                                            <button style={{background :"#E5E5E5" , border:"2px solid #d7d7d7",borderRadius:5,padding:3,margin:3}} onClick={onFileUpload}>Upload</button>
                                        </FormGroup>
                                    </Col>            */}
                                <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="plantDate">Planting Date</label>
                                            <FormInput
                                                id='plantDate'
                                                placeholder="Planting Date"
                                                type='date'
                                                className={`form-control form-control-md ${plantDateErr ? 'is-invalid' : ""}`}
                                                value={cropData.plantDate}
                                                onChange={e => setCropData({...cropData , plantDate : e.target.value})}
                                            />
                                             <div className="invalid-feedback">{plantDateErr}</div>

                                        </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">

                                    <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                        <label htmlFor="Practical Fraction Ru">Practical Fraction Ru</label>
                                        <FormInput
                                            id='Practical Fraction Ru'
                                            placeholder='Practical Fraction Ru'
                                            value={cropData.fractionRuPratique}
                                            onChange={e => { setCropData({...cropData , fractionRuPratique : e.target.value}) }}

                                        />
                                    </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">

<FormGroup className='d-flex justify-content-center align-items-center flex-column'>
    <label htmlFor="_hours">{t('Temp.')}</label>
    <FormInput
        id='_hours'
        placeholder={t('Temp.')}
        value={cropData.minTemp}
        onChange={e => { setCropData({...cropData , minTemp : e.target.value}) }}
        type="number"                            
    />
</FormGroup>
</Col>
<Col lg='6' md="12" sm="12">

<FormGroup className='d-flex justify-content-center align-items-center flex-column'>
    <label htmlFor="_hours">Number of hours</label>
    <FormInput
        id='_hours'
        placeholder='Number of hours of cold'
        value={cropData.totalHours}
        onChange={e => { setCropData({...cropData , totalHours : e.target.value}) }}
        type="number"                            

    />
</FormGroup>
</Col>
                                </Row>
                            </CardBody>
                        </Col>

                        <Col lg="5" md="12" sm="12" className="pt-3">
                            <h6>Kc</h6>
                            <div  className='d-flex justify-content-center align-items-center'>
                                
                                    <FormInput
                                       placeholder=""
                                        className="m-1"
                                        value={cropData.kcInit}
                                        onChange={e => setCropData({...cropData , kcInit : e.target.value})}
                                     />
                                        <FormInput
                                       placeholder=""
                                       value={cropData.kcDev}
                                       onChange={e => setCropData({...cropData , kcDev: e.target.value})}

                                     />
                                     <FormInput
                                       placeholder=""
                                       className="m-1"
                                       value={cropData.kcMid}
                                       onChange={e => setCropData({...cropData , kcMid : e.target.value})}

                                     />      
                                     <FormInput
                                       placeholder=""
                                       value={cropData.kcLate}
                                       onChange={e => setCropData({...cropData , kcLate : e.target.value})}

                                     />   
                            </div>  
                            <h6>Stage (Days)</h6>   
                            <div  className='d-flex justify-content-around align-items-center'>
                                
                                    <FormInput
                                       placeholder="Init"
                                        className="m-1"
                                        value={cropData.init}
                                        onChange={e => setCropData({...cropData , init : e.target.value})}
                                     />
                                        <FormInput
                                       placeholder="Dev"
                                       value={cropData.dev}
                                       onChange={e => setCropData({...cropData , dev : e.target.value})}
                                     />
                                     <FormInput
                                       placeholder="Mid"
                                       className="m-1"
                                       value={cropData.mid}
                                       onChange={e => setCropData({...cropData , mid : e.target.value})}
                                     />      
                                     <FormInput
                                       placeholder="Late"
                                       value={cropData.late}
                                       onChange={e => setCropData({...cropData , late : e.target.value})}
                                     />      
                            </div>  
                            <h6>Roots</h6>   
                            <div  className='d-flex justify-content-around align-items-center'>
                                
                                    <FormInput
                                       placeholder="Min"
                                        className="m-1"
                                        value={cropData.rootMin}
                                        onChange={e => setCropData({...cropData , rootMin : e.target.value})}

                                     />
                                        <FormInput
                                       placeholder="Max"
                                       value={cropData.rootMax}
                                       onChange={e => setCropData({...cropData , rootMax : e.target.value})}
                                     />                               
                            </div>          
                        </Col>
                    </Row>
                    <Row className="border-top mt-2">
                        <Col lg='12' md='12' sm='12' className="mt-1" >
                            {/* <button onClick={() => tableConfigKc()}>Calculer</button> */}
                        <table className="table mb-0 border text-center">
                            <thead className="bg-light">
                                <tr>
                                    <th scope="col" className="border-0">{t('Days')}</th>
                                    <th scope="col" className="border-0">{t('Dates')}</th>
                                    <th scope="col" className="border-0">{t('Kc')}</th>
                              
                                </tr>
                            </thead>
                            {tableConfigKc()}
                        </table>
                        </Col>
                    </Row>
                        </ModalBody>
        </Modal>
        <Modal size='lg' centered={true} open={toggleEdit}>
                        <ModalHeader className="d-flex justify-content-between align-items-center">
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
        
                                }}
                            >
                                <Button
                                    // theme="success"
                                    onClick={()  => {handleEdit(singleCrop.id)}}
                                    className="mb-2 mr-1 btn btn-success"
                                >
                                    <i class={`fa fa-check mx-2`}></i>
                                    {t('save')}
                                </Button>
                                <Button
                                    // theme="success"
                                    className="mb-2 mr-1 btn btn-danger"
                                    onClick={() => {setToggleEdit(false)} }
                                >
                                    <i class={`fa fa-times mx-2`}></i>
                                    {t('cancel')}
                                </Button>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                        <Row>
                        <Col lg="7" md="12" sm="12" className="border-right" >

                            <CardBody>
                                <Row>
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Type</label>
                                            <FormInput
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={cropData.crop}
                                                onChange={e => setCropData({...cropData , crop : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Type (Ar)</label>
                                            <FormInput
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={cropData.cropAr}
                                                onChange={e => setCropData({...cropData , cropAr : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Type (En)</label>
                                            <FormInput
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={cropData.cropEn}
                                                onChange={e => setCropData({...cropData , cropEn : e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>      
                                    <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="crop">Crop Photo</label>
                                            <FormInput
                                                id='crop'
                                                type="file"
                                                placeholder="Crop Photo"
                                                // value={cropData.cropPhoto}
                                                onChange={onFileChange}
                                            />
                                            <button style={{background :"#E5E5E5" , border:"2px solid #d7d7d7",borderRadius:5,padding:3,margin:3}} onClick={onFileUploadEdit}>Upload</button>
                                            {uploadedFile ? <h6 style={{fontWeight :"bold"}}>{uploadedFile.message}</h6> : null}

                                        </FormGroup>
                                    </Col> 
                                <Col lg='6' md="12" sm="12">
                                        <FormGroup>
                                            <label htmlFor="plantDate">Planting Date</label>
                                            <FormInput
                                                id='plantDate'
                                                placeholder="Planting Date"
                                                type='date'
                                                className={`form-control form-control-md ${plantDateErr ? 'is-invalid' : ""}`}
                                                value={cropData.plantDate}
                                                onChange={e => setCropData({...cropData , plantDate : e.target.value})}
                                            />
                                             <div className="invalid-feedback">{plantDateErr}</div>

                                        </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">

                                    <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                        <label htmlFor="Practical Fraction Ru">Practical Fraction Ru</label>
                                        <FormInput
                                            id='Practical Fraction Ru'
                                            placeholder='Practical Fraction Ru'
                                            value={cropData.fractionRuPratique}
                                            onChange={e => { setCropData({...cropData , fractionRuPratique : e.target.value}) }}

                                        />
                                    </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">

                                    <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                        <label htmlFor="_hours">{t('Temp.')}</label>
                                        <FormInput
                                            id='_hours'
                                            placeholder={t('Temp.')}
                                            value={cropData.minTemp}
                                            onChange={e => { setCropData({...cropData , minTemp : e.target.value}) }}
                                            type="number"                            

                                        />
                                    </FormGroup>
                                    </Col>
                                    <Col lg='6' md="12" sm="12">

                                    <FormGroup className='d-flex justify-content-center align-items-center flex-column'>
                                        <label htmlFor="_hours">Number of hours of cold</label>
                                        <FormInput
                                            id='_hours'
                                            placeholder='Number of hours of cold'
                                            value={cropData.totalHours}
                                            onChange={e => { setCropData({...cropData , totalHours : e.target.value}) }}
                                            type="number"                            

                                        />
                                    </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Col>

                        <Col lg="5" md="12" sm="12" className="pt-3">
                            <h6>Kc</h6>
                            <div  className='d-flex justify-content-center align-items-center'>
                                
                            <FormInput
                                       placeholder=""
                                        className="m-1"
                                        value={cropData.kcInit}
                                        onChange={e => setCropData({...cropData , kcInit : e.target.value})}
                                     />
                                        <FormInput
                                       placeholder=""
                                       value={cropData.kcDev}
                                       onChange={e => setCropData({...cropData , kcDev: e.target.value})}

                                     />
                                     <FormInput
                                       placeholder=""
                                       className="m-1"
                                       value={cropData.kcMid}
                                       onChange={e => setCropData({...cropData , kcMid : e.target.value})}

                                     />      
                                     <FormInput
                                       placeholder=""
                                       value={cropData.kcLate}
                                       onChange={e => setCropData({...cropData , kcLate : e.target.value})}

                                     />   
                            </div>  
                            <h6>Stage (Days)</h6>   
                            <div  className='d-flex justify-content-around align-items-center'>
                                
                                    <FormInput
                                       placeholder="Init"
                                        className="m-1"
                                        value={cropData.init}
                                        onChange={e => setCropData({...cropData , init : e.target.value})}
                                     />
                                        <FormInput
                                       placeholder="Dev"
                                       value={cropData.dev}
                                       onChange={e => setCropData({...cropData , dev : e.target.value})}
                                     />
                                     <FormInput
                                       placeholder="Mid"
                                       className="m-1"
                                       value={cropData.mid}
                                       onChange={e => setCropData({...cropData , mid : e.target.value})}
                                     />      
                                     <FormInput
                                       placeholder="Late"
                                       value={cropData.late}
                                       onChange={e => setCropData({...cropData , late : e.target.value})}
                                     />      
                            </div>  
                            <h6>Roots</h6>   
                            <div  className='d-flex justify-content-around align-items-center'>
                                
                            <FormInput
                                       placeholder="Min"
                                        className="m-1"
                                        value={cropData.rootMin}
                                        onChange={e => setCropData({...cropData , rootMin : e.target.value})}

                                     />
                                        <FormInput
                                       placeholder="Max"
                                       value={cropData.rootMax}
                                       onChange={e => setCropData({...cropData , rootMax : e.target.value})}
                                     />   
                            </div>          
                        </Col>
                    </Row>
                    <Row className="border-top mt-2">
                        <Col lg='12' md='12' sm='12' className="mt-1" >
                            {/* <button onClick={() => tableConfigKc()}>Calculer</button> */}
                        <table className="table mb-0 border text-center">
                            <thead className="bg-light">
                                <tr>
                                    <th scope="col" className="border-0">{t('Days')}</th>
                                    <th scope="col" className="border-0">{t('Dates')}</th>
                                    <th scope="col" className="border-0">{t('Kc')}</th>
                              
                                </tr>
                            </thead>
                            <tbody>
                            {
                                cropData.allKcList && cropData.allKcList.map((result,indx)=>{
                                   
                                    return(

                                        <tr>
                                            <td>{result.day}</td>
                                            <td>
                                            <input
                                                name={indx}
                                                key={indx}
                                                className='my-1'
                                                defaultValue={parseFloat(result.kc).toFixed(2)}
                                                onChange={(e) => onChangeHandler(e, indx)}
                                            />    
                                            </td>
                                        </tr>
                                    )
                                })
                            }

                         </tbody>
                        </table>
                        </Col>
                    </Row>
                        </ModalBody>
        </Modal>
        </>
    )
}

export default ConfigurationCrops