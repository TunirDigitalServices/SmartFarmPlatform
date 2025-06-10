import React, { useEffect, useState } from 'react'
import {
    Container, Card, Row, Col, Form,
    ButtonGroup, Button, Modal
} from "react-bootstrap";
import PageTitle from '../components/common/PageTitle';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import api from '../api/api';
import swal from 'sweetalert';
import Pagination from '../views/Pagination';
import moment from 'moment';

const ConfigurationCropsVariety = () => {

    const [cropsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1);

    const [kc, setKc] = useState({})

    const [SearchName, setSearchName] = useState('')


    const paginate = pageNumber => setCurrentPage(pageNumber);

    const { t, i18n } = useTranslation();


    const [allCrops, setAllCrops] = useState([])
    const [allVarieties, setAllVarieties] = useState([])


    const [varietyData, setVarietyData] = useState({
        crop: '',
        cropVariety: '',
        init: "",
        dev: "",
        mid: "",
        late: "",
        plantDate: "",
        rootMin: "",
        rootMax: "",
        kcInit: "",
        kcDev: "",
        kcMid: "",
        kcLate: "",
        allKcList: [],
        varietyAr: "",
        varietyEn: "",
        varietyPhoto: ""
    })


    const [toggle, setToggle] = useState(false)
    const [toggleEdit, setToggleEdit] = useState(false)
    const [singleCrop, setSingleVariety] = useState({})

    const [kcByDays, setKcByDays] = useState([])
    const [resultCalculKc, setResultCalculKc] = useState([])

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState({});

    const getCrops = async () => {
        try {
            await api.get('/crops/get-crops')
                .then(response => {
                    if (response.data.type === "success") {
                        let listCrops = response.data.Crops
                        setAllCrops(listCrops)

                    }
                }).catch(error => {
                    console.log(error)
                })

        } catch (error) {
            console.log(error)
        }
    }

    const getVarieties = async () => {
        try {
            await api.get('/varieties/get-varieties')
                .then(response => {
                    if (response.data.type === "success") {
                        let listVarieties = response.data.Varieties
                        console.log(listVarieties, "listVarieties");

                        setAllVarieties(listVarieties)

                    }
                }).catch(error => {
                    console.log(error)
                })

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getCrops()
        getVarieties()
    }, [])

    const getSingleVariety = (varietyId, title) => {

        let data = {
            variety_id: varietyId,
        }

        api.post('/varieties/get-variety', data)
            .then(res => {
                let dataVarieties = res.data.variety
                let date = dataVarieties.plant_date
                setSingleVariety(dataVarieties)
                // setVarietyData({crop : dataVarieties.crop})
                setVarietyData({ cropVariety: dataVarieties.crop_variety })
                setVarietyData({ plantDate: date.slice(0, 10) })
                setVarietyData({ init: dataVarieties.init })
                setVarietyData({ dev: dataVarieties.dev })
                setVarietyData({ mid: dataVarieties.mid })
                setVarietyData({ late: dataVarieties.late })
                setVarietyData({ rootMin: dataVarieties.root_min })
                setVarietyData({ rootMax: dataVarieties.root_max })
                setVarietyData({ kcInit: dataVarieties.kc_init })
                setVarietyData({ kcDev: dataVarieties.kc_dev })
                setVarietyData({ kcMid: dataVarieties.kc_mid })
                setVarietyData({ kcLate: dataVarieties.kc_late })
                setVarietyData({ allKcList: dataVarieties.all_kc })
            }).catch(error => {
                console.log(error)

            })
        if (title === 'Edit') {
            setToggleEdit(!toggleEdit)

        }

    }
    const onFileChange = e => {
        setSelectedFile(e.target.files[0]);
    };


    const onFileUploadEdit = async () => {
        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('variety', singleCrop.crop_variety);

        try {
            const res = await api.post('/variety/upload-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadedFile(res.data);
        } catch (err) {
            console.error(err);
        }
    };



    const addVarieties = () => {
        let data = {
            crop_id: varietyData.crop,
            crop_variety: varietyData.cropVariety,
            plant_date: varietyData.plantDate,
            init: varietyData.init,
            dev: varietyData.dev,
            mid: varietyData.mid,
            late: varietyData.late,
            kc_init: varietyData.kcInit,
            kc_dev: varietyData.kcDev,
            kc_mid: varietyData.kcMid,
            kc_late: varietyData.kcLate,
            root_max: varietyData.rootMax,
            root_min: varietyData.rootMin,
            all_kc: resultCalculKc
        }

        api.post('/varieties/add-varieties', data)
            .then(response => {
                if (response && response.data.type === "success") {
                    swal(`${t('Crop Variety Added')}`, { icon: "success" });
                    setToggle(false)
                    getVarieties()
                }
                if (response && response.data.type === "danger") {
                    swal(`${t('Crop Variety Added')}`, { icon: "error" });
                }
            }).catch(error => {
                console.log(error)
            })
    }

    const handleEdit = (varietyId) => {

        let data = {
            variety_id: varietyId,
            crop_variety: varietyData.cropVariety,
            plant_date: varietyData.plantDate,
            init: varietyData.init,
            dev: varietyData.dev,
            mid: varietyData.mid,
            late: varietyData.late,
            kc_init: varietyData.kcInit,
            kc_dev: varietyData.kcDev,
            kc_mid: varietyData.kcMid,
            kc_late: varietyData.kcLate,
            root_max: varietyData.rootMax,
            root_min: varietyData.rootMin,
            all_kc: resultCalculKc
        }



        api.post('/varieties/edit-variety', data)
            .then(response => {
                if (response.data.type == "success") {
                    swal(" Variety has been updated", {
                        icon: "success",
                    });
                    setToggleEdit(false)
                    getVarieties();
                }
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'error_edit_variety'
                    })
                    return false;
                }
            }).catch(error => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'error_edit_variety'
                })
            })


    }


    const handleDelete = async varietyId => {


        let data = {
            variety_id: varietyId,
        }
        await api.delete('/varieties/delete-variety', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: "Cannot Delete Variety",
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    getVarieties();

                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete Variety",
                    icon: "error",
                    text: 'error_delete_variety'

                });
            })
    }

    const confirmDelete = cropId => {

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this variety!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(cropId)
                    swal(" Variety has been deleted!", {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: "Cannot Delete Variety",
                    icon: "error",
                    text: 'error_delete_variety'

                });
            })

    }


    const filteredCrops = allVarieties.filter(cropsVariety => {
        if (SearchName !== '') {
            return (
                cropsVariety.crop_variety.toLowerCase().includes(SearchName.toLowerCase())
            )
        }

        return cropsVariety
    })

    const indexOfLastPost = currentPage * cropsPerPage;
    const indexOfFirstPost = indexOfLastPost - cropsPerPage;
    // const currentVarieties = filteredCrops.slice(indexOfFirstPost, indexOfLastPost);


    // Sort by crop name (from allCrops)
    const sortedVarieties = [...filteredCrops].sort((a, b) => {
        const cropA = allCrops.find(crop => crop.id === a.crop_id)?.crop?.toLowerCase() || '';
        const cropB = allCrops.find(crop => crop.id === b.crop_id)?.crop?.toLowerCase() || '';
        return cropA.localeCompare(cropB);
    });

    const currentVarieties = sortedVarieties.slice(indexOfFirstPost, indexOfLastPost);

    const handleKcByDays = () => {
        let DataCropKc = []
        if (varietyData.init != "" && varietyData.dev != "" && varietyData.mid != "" && varietyData.late != "" &&
            varietyData.kcInit != "" && varietyData.kcDev != "" && varietyData.kcMid != "" && varietyData.kcLate != ""

        ) {
            DataCropKc = [
                {
                    "period": varietyData.init,
                    "kc": varietyData.kcInit
                },
                {
                    "period": varietyData.dev,
                    "kc": varietyData.kcDev
                },
                {
                    "period": varietyData.mid,
                    "kc": varietyData.kcMid
                },
                {
                    "period": varietyData.late,
                    "kc": varietyData.kcLate
                }]
        }



        setKcByDays(DataCropKc)
    }

    useEffect(() => {
        handleKcByDays()
    }, [varietyData])

    const onChangeHandler = async (e, idx) => {
        //modifier le setResultCalculKc pour ensuite ajouter le resultCalculKc dans l'action save pour inserer un objet clé (1,2,3..) valeur (kc dans le tableau html) dans la base de données colonne kc par jour
        // setResultCalculKc(state => ([...state ,{['day'] : day ,  ['kc'] : value }]), [])
        let clone = [...varietyData.allKcList];
        let obj = clone[idx];
        obj.kc = e.target.value;
        clone[idx] = obj;
        setResultCalculKc([...clone])
    }

    let KcResults = [];
    useEffect(() => {
        setResultCalculKc(KcResults)
    }, [kcByDays])
    const tableConfigKc = (async) => {
        let periods = [];
        let KcValues = [];

        if (kcByDays.length > 0) {
            kcByDays.map(days => {
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
            let resultFormule = [];
            for (let i = 0; i < arrayPeriod.length; i++) {
                if (i == 0) {
                    j = 1
                }
                if (i > 0) {
                    j = arrayPeriod[i - 1]

                }

                if (i + 1 in arrayPeriod === true) {
                    nextKc = KcValues[i + 1]
                    nextPeriod = arrayPeriod[i + 1]
                }
                else {
                    nextKc = 0
                    nextPeriod = 0
                }
                currentPeriod = arrayPeriod[i]
                for (let n = 1; n <= currentPeriod; n++) {
                    ligne = compteur++;
                    if (nextKc > 0 && nextPeriod > 0) {
                        result = (parseFloat((nextKc - KcValues[i]) / (nextPeriod)) + parseFloat(KcValues[i]))


                    } else {
                        result = parseFloat(KcValues[i]);
                    }

                    //@TODO ajouter le tableau dans setResultCalculKc
                    elment = {
                        "day": ligne,
                        "kc": result
                    }
                    //object result to save in database
                    KcResults.push(elment)
                    let dates = moment(varietyData.plantDate).add(ligne - 1, 'days').format("YYYY-MM-DD")

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
                                        onChange={(e) => onChangeHandler(e.target.value, ligne)}
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


    useEffect(() => {
        setCurrentPage(1);
    }, [SearchName]);



    return (
        <>
            <Container className="p-4">
                <Row noGutters className="page-header py-4">
                    <PageTitle
                        sm="4"
                        title={t('Crops Varieties Configuration')}
                        subtitle={t('Crops Varieties Configuration')}
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
                        <Form.Group>
                            <div className="d-flex">
                                <Form.Control
                                    value={SearchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    id="search"
                                    placeholder="Search By Name " />

                            </div>
                        </Form.Group>
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
                        <Button variant='outline-primary' onClick={() => { setToggle(true) }}>Add Variety</Button>
                    </ButtonGroup>

                </Row>
                <Card>
                    <Card.Header className="border-bottom">
                        <div>
                            <h5>
                                Crops Varieties Info

                            </h5>

                        </div>
                    </Card.Header>
                    <Card.Body>
                        <table className="table mb-0 text-center  table-responsive-lg">
                            <thead className="bg-light">
                                <tr>
                                    <th scope="col" className="border-0">{t('Crop')}</th>
                                    <th scope="col" className="border-0">{t('Crop Variety')}</th>
                                    <th scope="col" className="border-0">{t('Planting Date')}</th>
                                    <th scope="col" className="border-0"></th>

                                </tr>
                            </thead>
                            <tbody>
                                {console.log(currentVarieties, "cur")}
                                {


                                    currentVarieties.map(crop => {
                                        let cropName = ''
                                        allCrops.map(crops => {
                                            if (crop.crop_id === crops.id) {
                                                cropName = crops.crop
                                            }

                                        })
                                        let plantDate = moment(crop.plant_date).locale('En').format('MMM Do YYYY ')
                                        return (
                                            <tr>
                                                <td>{cropName}</td>
                                                <td>{crop.crop_variety}</td>
                                                <td>{plantDate}</td>


                                                <td>

                                                    <ButtonGroup size="sm" className="mr-2">
                                                        <Button title="Edit" onClick={() => { getSingleVariety(crop.id, 'Edit') }} squared><i className="material-icons">&#xe3c9;</i></Button>
                                                        <Button title="Delete" onClick={() => { confirmDelete(crop.id) }} squared variant="danger"><i className="material-icons">&#xe872;</i></Button>
                                                    </ButtonGroup>


                                                </td>

                                            </tr>

                                        )
                                    })
                                }



                            </tbody>
                        </table>
                    </Card.Body>
                </Card>
                <Row className="py-4 justify-content-center">
                    <Pagination usersPerPage={cropsPerPage} totalUsers={filteredCrops.length} paginate={paginate} />

                </Row>
            </Container>
            <Modal size='lg' centered={true} show={toggle}>
                <Modal.Header className="d-flex justify-content-between align-items-center">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            width: "100%"
                        }}
                    >
                        <Button
                            // theme="success"
                            onClick={() => { addVarieties() }}
                            className="mb-2 mr-1 btn btn-success"
                        >
                            <i class={`fa fa-check mx-2`}></i>
                            {t('save')}
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => { setToggle(false) }}
                        >
                            <i class={`fa fa-times mx-2`}></i>
                            {t('cancel')}
                        </Button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Row className='gap-2'>
                        <Col lg="7" md="12" sm="12" className="border-right" >

                            <Card.Body>
                                <Row className='gap-2'>
                                    <Col lg='5' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="crop">Crop Type</label>
                                            <Form.Select
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={varietyData.crop || ""}
                                                onChange={e => setVarietyData({ ...varietyData, crop: e.target.value })}
                                            >
                                                <option value="">Select Crop</option>
                                                {
                                                    allCrops.map(crop => {
                                                        return (
                                                            <option value={crop.id}>{crop.crop}</option>
                                                        )
                                                    })
                                                }
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg='5' md="12" sm="12">

                                        <Form.Group className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="type">Select Variety Type</label>

                                            <Form.Control
                                                id='type'
                                                style={{ height: "40px" }}
                                                value={varietyData.cropVariety}
                                                onChange={e => setVarietyData({ ...varietyData, cropVariety: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>

                                </Row>
                                <Row>

                                    <Col lg='5' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="plantDate">Planting Date</label>
                                            <Form.Control
                                                id='plantDate'
                                                placeholder="Planting Date"
                                                type='date'
                                                value={varietyData.plantDate}
                                                onChange={e => setVarietyData({ ...varietyData, plantDate: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group>
                                    <label htmlFor="feDescription">{t('desc')}</label>
                                    <Form.Control
                                        as="textarea"
                                        className=''
                                        placeholder={t('desc')}
                                        id="feDescription"
                                        rows="3" />

                                </Form.Group>
                            </Card.Body>
                        </Col>

                        <Col lg="4" md="12" sm="12" className="">
                            <h6>Kc</h6>
                            <div className='d-flex justify-content-center align-items-center'>

                                <Form.Control
                                    placeholder=""
                                    className="m-1"
                                    value={varietyData.kcInit}
                                    onChange={e => setVarietyData({ ...varietyData, kcInit: e.target.value })}
                                />
                                <Form.Control
                                    placeholder=""
                                    value={varietyData.kcDev}
                                    onChange={e => setVarietyData({ ...varietyData, kcDev: e.target.value })}

                                />
                                <Form.Control
                                    placeholder=""
                                    className="m-1"
                                    value={varietyData.kcMid}
                                    onChange={e => setVarietyData({ ...varietyData, kcMid: e.target.value })}

                                />
                                <Form.Control
                                    placeholder=""
                                    value={varietyData.kcLate}
                                    onChange={e => setVarietyData({ ...varietyData, kcLate: e.target.value })}

                                />
                            </div>
                            <h6>Stage (Days)</h6>
                            <div className='d-flex justify-content-around align-items-center'>

                                <Form.Control
                                    placeholder="Init"
                                    className="m-1"
                                    value={varietyData.init}
                                    onChange={e => setVarietyData({ ...varietyData, init: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="Dev"
                                    value={varietyData.dev}
                                    onChange={e => setVarietyData({ ...varietyData, dev: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="Mid"
                                    className="m-1"
                                    value={varietyData.mid}
                                    onChange={e => setVarietyData({ ...varietyData, mid: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="Late"
                                    value={varietyData.late}
                                    onChange={e => setVarietyData({ ...varietyData, late: e.target.value })}
                                />
                            </div>
                            <h6>Roots</h6>
                            <div className='d-flex justify-content-around align-items-center'>

                                <Form.Control
                                    placeholder="Min"
                                    className="m-1"
                                    value={varietyData.rootMin}
                                    onChange={e => setVarietyData({ ...varietyData, rootMin: e.target.value })}

                                />
                                <Form.Control
                                    placeholder="Max"
                                    value={varietyData.rootMax}
                                    onChange={e => setVarietyData({ ...varietyData, rootMax: e.target.value })}
                                />

                            </div>
                        </Col>
                    </Row>
                    <Row className="border-top mt-2">
                        <Col lg='12' sm='12' md='12'>

                            <table className="table mb-0 border text-center  table-responsive">
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
                </Modal.Body>
            </Modal>
            <Modal size='lg' centered={true} show={toggleEdit}>
                <Modal.Header className="d-flex justify-content-between align-items-center">
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            width: "100%"

                        }}
                    >
                        <Button
                            // theme="success"
                            onClick={() => { handleEdit(singleCrop.id) }}
                            className="mb-2 mr-1 btn btn-success"
                        >
                            <i class={`fa fa-check mx-2`}></i>
                            {t('save')}
                        </Button>
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-danger"
                            onClick={() => { setToggleEdit(false) }}
                        >
                            <i class={`fa fa-times mx-2`}></i>
                            {t('cancel')}
                        </Button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Row className='gap-3'>
                        <Col lg="8" md="12" sm="12" className="border-right" >

                            <Card.Body>
                                <Row className='gap-2'>
                                    {/* <Col lg='6' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="crop">Crop Type</label>
                                            <Form.Control
                                                id='crop'
                                                placeholder="Crop Type"
                                                value={varietyData.crop}
                                                onChange={e => setVarietyData({...varietyData , crop : e.target.value})}
                                            />
                                        </Form.Group>
                                    </Col> */}
                                    <Col lg='5' md="12" sm="12">

                                        <Form.Group className='d-flex justify-content-center align-items-center flex-column'>
                                            <label htmlFor="type">Select Variety Type</label>

                                            <Form.Control
                                                id='type'
                                                value={varietyData.cropVariety}
                                                onChange={e => setVarietyData({ ...varietyData, cropVariety: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg='5' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="Varietyar">Variety Type (Ar)</label>
                                            <Form.Control
                                                id='Varietyar'
                                                placeholder="Variety Type"
                                                value={varietyData.varietyAr}
                                                onChange={e => setVarietyData({ ...varietyData, varietyAr: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg='5' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="Varietyen">Variety Type (En)</label>
                                            <Form.Control
                                                id='Varietyen'
                                                placeholder="Variety Type"
                                                value={varietyData.varietyEn}
                                                onChange={e => setVarietyData({ ...varietyData, varietyEn: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg='5' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="crop">Variety Photo</label>
                                            <Form.Control
                                                id='crop'
                                                type="file"
                                                placeholder="Crop Photo"
                                                // value={cropData.cropPhoto}
                                                onChange={onFileChange}
                                            />
                                            <button style={{ background: "#E5E5E5", border: "2px solid #d7d7d7", borderRadius: 5, padding: 3, margin: 3 }} onClick={onFileUploadEdit}>Upload</button>
                                            {uploadedFile ? <h6 style={{ fontWeight: "bold" }}>{uploadedFile.message}</h6> : null}

                                        </Form.Group>
                                    </Col>

                                </Row>
                                <Row>

                                    <Col lg='6' md="12" sm="12">
                                        <Form.Group>
                                            <label htmlFor="plantDate">Planting Date</label>
                                            <Form.Control
                                                id='plantDate'
                                                placeholder="Planting Date"
                                                type='date'
                                                value={varietyData.plantDate}
                                                onChange={e => setVarietyData({ ...varietyData, plantDate: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group>
                                    <label htmlFor="feDescription">{t('desc')}</label>
                                    <Form.Control
                                        as="textarea"
                                        placeholder={t('desc')}
                                        id="feDescription"
                                        rows="3" />

                                </Form.Group>
                            </Card.Body>
                        </Col>

                        <Col lg="3" md="12" sm="12" className="">
                            <h6>Kc</h6>
                            <div className='d-flex justify-content-center align-items-center'>

                                <Form.Control
                                    placeholder=""
                                    className="m-1"
                                    value={varietyData.kcInit}
                                    onChange={e => setVarietyData({ ...varietyData, kcInit: e.target.value })}
                                />
                                <Form.Control
                                    placeholder=""
                                    value={varietyData.kcDev}
                                    onChange={e => setVarietyData({ ...varietyData, kcDev: e.target.value })}

                                />
                                <Form.Control
                                    placeholder=""
                                    className="m-1"
                                    value={varietyData.kcMid}
                                    onChange={e => setVarietyData({ ...varietyData, kcMid: e.target.value })}

                                />
                                <Form.Control
                                    placeholder=""
                                    value={varietyData.kcLate}
                                    onChange={e => setVarietyData({ ...varietyData, kcLate: e.target.value })}

                                />
                            </div>
                            <h6>Stage (Days)</h6>
                            <div className='d-flex justify-content-around align-items-center'>

                                <Form.Control
                                    placeholder="Init"
                                    className="m-1"
                                    value={varietyData.init}
                                    onChange={e => setVarietyData({ ...varietyData, init: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="Dev"
                                    value={varietyData.dev}
                                    onChange={e => setVarietyData({ ...varietyData, dev: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="Mid"
                                    className="m-1"
                                    value={varietyData.mid}
                                    onChange={e => setVarietyData({ ...varietyData, mid: e.target.value })}
                                />
                                <Form.Control
                                    placeholder="Late"
                                    value={varietyData.late}
                                    onChange={e => setVarietyData({ ...varietyData, late: e.target.value })}
                                />
                            </div>
                            <h6>Roots</h6>
                            <div className='d-flex justify-content-around align-items-center'>

                                <Form.Control
                                    placeholder="Min"
                                    className="m-1"
                                    value={varietyData.rootMin}
                                    onChange={e => setVarietyData({ ...varietyData, rootMin: e.target.value })}

                                />
                                <Form.Control
                                    placeholder="Max"
                                    value={varietyData.rootMax}
                                    onChange={e => setVarietyData({ ...varietyData, rootMax: e.target.value })}
                                />

                            </div>
                        </Col>
                    </Row>
                    <Row className="border-top mt-2">
                        <Col lg='6' md='12' sm='12' className="mt-1" >
                            {/* <button onClick={() => tableConfigKc()}>Calculer</button> */}
                            <table className="table mb-0 border text-center  table-responsive">
                                <thead className="bg-light">
                                    <tr>
                                        <th scope="col" className="border-0">{t('Days')}</th>
                                        <th scope="col" className="border-0">{t('Dates')}</th>
                                        <th scope="col" className="border-0">{t('Kc')}</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        varietyData.allKcList && varietyData.allKcList.map((result, indx) => {

                                            return (

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
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ConfigurationCropsVariety