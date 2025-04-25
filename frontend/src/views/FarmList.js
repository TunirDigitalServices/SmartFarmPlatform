import React, { useState, useEffect } from 'react'
import { Button, ButtonGroup, Modal, ModalBody, ModalHeader, Row, Col, FormInput, FormGroup, Form } from 'shards-react'
import api from '../api/api'
import swal from 'sweetalert'
import { useTranslation } from "react-i18next";


const FarmList = ({ farmList, Farms }) => {

    const { t, i18n } = useTranslation();

    const [msgServer,setMsg] = useState("")

    const [classMsg , setCmsg] = useState("")
    const [displayMsg , setDispMsg] = useState("hide")
    const [iconMsg,setIconMsg]=useState("info")




    const [toggle, setToggle] = useState(false);


    const [name, setName] = useState('');
    const [groupName, setGN] = useState('');
    const [description, setDesc] = useState('');

    const [nameError, setNameErr] = useState("");


    const [SingleFarm, setSingleFarm] = useState([])



    const getSingleFarm = async (farmUid) => {
        let data = {
            farm_uid: farmUid,
        }
        await api.post('/farm', data)
            .then(res => {
                let FarmData = res.data.farm
                console.log(FarmData[0])
                setSingleFarm(FarmData)
                setName(FarmData[0].name)
                setDesc(FarmData[0].description)
                setGN(FarmData[0].name_group)
            }).catch(error => {
                console.log(error)

            })
        setToggle(!toggle)
    }


    const validate = () => {
        let nameError = '';

        if (!name) {
            nameError = 'Cannot be blank!';
            setNameErr(nameError)
            return false;
        } else {
            setNameErr("")
            return true;
        }

    };



    const handleEdit = (farmUid) => {


        let user = JSON.parse(localStorage.getItem('user'));
        let user_uid = user.id

        let data = {
            name: name,
            name_group: groupName,
            description: description,
            user_uid,
            farm_uid: farmUid
        }

        let isValid = validate()

        if (isValid) {
            api.post('/farm/edit-farm', data)
                .then(response => {
                    if (response.data.type == "success") {
                        swal(`${t('farm_updated')}`, {
                            icon: "success",
                        });
                        setToggle(false)
                        Farms();
                    }
                    if (response.data.type && response.data.type == "danger") {
                        swal({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Error'
                        })
                        return false;
                    }
                }).catch(error => {
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Error'
                    })
                })

        }
    }


    const handleDelete = async farmUid => {

    

        let data = {
            farm_uid: farmUid,
        }
        await api.delete('/farm/delete-farm', { data: data })
            .then(response => {
                if (response.data.type && response.data.type == "danger") {
                    swal({
                        title: `${t('cannot_delete')}`,
                        icon: "warning",
                    });
                }
                if (response.data.type == "success") {
                    Farms();
                    setMsg(`${t('delete_success_farm')}`)
                    setCmsg("success")
                    setDispMsg("show")
                    setIconMsg("check")
                    hideMsg()
                }
            }).catch(error => {
                swal({
                    title: `${t('cannot_delete')}`,
                    icon: "error",
                    text: 'error_delete_farm'
                    
                });
            })
        }
            const hideMsg = () => {
                setTimeout(() => {
                    setDispMsg("hide")
                  }, 3000);

            }


    const confirmDelete = farmUid => {

        swal({
            title: `${t('are_you_sure')}`,
            text: `${t('confirm_delete')}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDelete(farmUid)
                    swal(`${t('delete_success_farm')}`, {
                        icon: "success",
                    });
                }
            }).catch(error => {
                swal({
                    title: `${t('cannot_delete')}`,
                    icon: "error",
                    text: 'Error'

                });
            })

    }



    return (
        <>
            <div className={`mb-0 alert alert-${classMsg} fade ${displayMsg}`}>
                 <i class={`fa fa-${iconMsg} mx-2`}></i> {t(msgServer)}
            </div>
            <table className="bg-light table mb-0 text-center table-bordered table-responsive-lg">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('name_farm')}</th>
                        <th scope="col" className="border-0">{t('desc')}</th>
                        <th scope="col" className="border-0">{t('Fields')}</th>
                        <th scope="col" className="border-0"></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        farmList.map((item, indx) => {
                            return (

                                <tr>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>
                                    {item.fields != null ? Object.keys(item.fields).length : 0}
                                        </td>
                                    <td>
                                        <ButtonGroup size="sm" className="mr-2">
                                            <Button onClick={() => getSingleFarm(item.uid)} squared><i className="material-icons">&#xe3c9;</i></Button>
                                            <Button onClick={() => confirmDelete(item.uid)} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            {
                SingleFarm.map(i => (
                    <Modal centered size='lg' open={toggle} >
                        <ModalHeader>
                            <titleClass className="m-0">{t('edit_farm')}</titleClass>
                            {""}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end"

                                }}
                            >
                                <Button
                                    // theme="success"
                                    className="mb-2 mr-1 float-right btn btn-success"
                                    onClick={() => handleEdit(i.uid)}
                                >
                                    {t('save')}
                                    <i class={`fa fa-check mx-2`}></i>
                                </Button>
                                <Button
                                    // theme="success"
                                    className="mb-2 mr-1 btn btn-danger"
                                    onClick={() => setToggle(false)}
                                >
                                    {t('cancel')}
                                    <i class={`fa fa-times mx-2`}></i>
                                </Button>
                            </div>

                        </ModalHeader>
                        <ModalBody>

                            <Form>
                                <Row form>
                                    <Col md="6" className="form-group">
                                        <p style={{ margin: "0px" }}>{t('name_farm')}</p>
                                        <FormInput
                                            key={i.id}
                                            defaultValue={name}
                                            onChange={e => setName(e.target.value)}
                                            className={`${nameError ? 'is-invalid' : ""}`}
                                        />

                                        <div className="invalid-feedback">{t('no_empty')}</div>

                                    </Col>
                                    <Col md="6" className="form-group">
                                        <p style={{ margin: "0px" }}>{t('group_name')}</p>
                                        <FormInput
                                            key={i.id}
                                            defaultValue={groupName}
                                            onChange={e => setGN(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                                <FormGroup>
                                    <p style={{ margin: "0px" }}>{t('desc')}</p>
                                    <textarea
                                        key={i.id}
                                        defaultValue={description}
                                        onChange={e => setDesc(e.target.value)}
                                        style={{ height: "275px" }}
                                        class="form-control"
                                    ></textarea>
                                </FormGroup>
                            </Form>

                        </ModalBody>
                    </Modal>
                ))
            }

        </>
    )
}

export default FarmList