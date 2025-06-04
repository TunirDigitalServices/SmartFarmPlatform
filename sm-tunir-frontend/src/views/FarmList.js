import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Modal, Button, ButtonGroup, Row, Col, Form } from "react-bootstrap"
import api from '../api/api';
import swal from 'sweetalert'


function FarmList({ }) {
    const [classMsg, setCmsg] = useState("")
    const [farmList, setFarmList] = useState([]);
    const [editedFarm, setEditedFarm] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggle, setToggle] = useState(false);

    const [displayMsg, setDispMsg] = useState("hide")
    const [iconMsg, setIconMsg] = useState("info")
    const [msgServer, setMsg] = useState("")
    const [country, setCountry] = useState('')
    const [cities, setCities] = useState('')
    const [allCities, setAllCities] = useState([])
    const [countries, setCountries] = useState([])
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const response = await api.get('/farm/farms');
                setFarmList(response.data.farms);
            } catch (err) {
                console.error('Failed to fetch farms', err);
            } finally {
                setLoading(false);
            }
        };
        const getCountries = async () => {
            await api.get('/countries/get-countries').then(res => {
                const countries = res.data.Countries;
                setCountries(countries);

            })
        }
        const getCities = async () => {
            await api.get('/cities/get-cities').then(res => {
                const cities = res.data.Cities;
                setAllCities(cities);

            })
        }

        fetchFarms();
        getCountries()
        getCities()
    }, []);



    const handleCountryPick = (e) => {
        e.preventDefault();
        const country = countries.find(
            (country) => country.iso === e.target.value
        );
        let Cities = []
        if (country) {
            allCities.map((city) => {
                if (city.iso === country.iso) {
                    Cities.push({
                        city: city.city,
                        id: city.id,
                        lat: city.lat,
                        lon: city.lon
                    })
                }
            });

            setCountry(country.iso);
            setCities(Cities)

        }
    };
    const handleEditFarm = async () => {
        try {
            const payload = {
                name: editedFarm.name,
                name_group: editedFarm.name_group,
                city_id: editedFarm.city_id,
                user_uid: editedFarm.user?.uid || editedFarm.user_uid,
                farm_uid: editedFarm.uid,
            };

            if (!payload.user_uid) {
                throw new Error("Missing user_uid in editedFarm");
            }

            const response = await api.post('/farm/edit-farm', payload);
            let updatedFarm = response.data.farm;


            const matchedCity = allCities.find(city => city.id == updatedFarm.city_id);
            if (matchedCity) {
                updatedFarm.city = matchedCity;
            }


            updatedFarm.user = editedFarm.user || { uid: editedFarm.user_uid };

            setFarmList(prev =>
                prev.map(f => (f.uid === updatedFarm.uid ? updatedFarm : f))
            );

            setToggle(false);
            setMsg("farm_updated_successfully");
            setIconMsg("check");
            setCmsg("success");
            setDispMsg("show");

        } catch (error) {
            console.error('Failed to edit farm:', error);
            setMsg("error_updating_farm");
            setIconMsg("times");
            setCmsg("danger");
            setDispMsg("show");
        }
    };
    const handleDeleteFarm = async (farm_uid) => {
       


        try {
            const res = await api.delete('/farm/delete-farm', { data: { farm_uid } });
            if (res.data.type && res.data.type == "danger") {
                swal({
                    title: `${t('cannot_delete')}`,
                    icon: "warning",
                });
            }
            setFarmList(prev => prev.filter(farm => farm.uid !== farm_uid));

            setMsg("farm_deleted_successfully");
            setIconMsg("check");
            setCmsg("success");
            setDispMsg("show");
        } catch (error) {
            console.error('Failed to delete farm:', error);
            setMsg("error_deleting_farm");
            setIconMsg("times");
            setCmsg("danger");
            setDispMsg("show");
        }
    };
    const confirmDelete = farm_uid => {

        swal({
            title: `${t('are_you_sure')}`,
            text: `${t('confirm_delete')}`,
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((Delete) => {
                if (Delete) {
                    handleDeleteFarm(farm_uid)
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
            <div style={{ overflowX: 'auto' }}>
                <table className="table mb-4 text-center table-bordered table-responsive-lg" >
                    <thead className="bg-light">
                        <tr>
                            <th scope="col" className="border-0">{t('name')}</th>
                            <th scope="col" className="border-0">{t('name_group')}</th>
                            <th scope="col" className="border-0">{t('city')}</th>
                            <th scope="col" className="border-0"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            farmList?.map((item, indx) => {


                                return (

                                    <tr>
                                        <td>{item.name}</td>
                                        <td>{item.name_group ? item.name_group : "-"}</td>
                                        <td>{item.city && item.city.city ? item.city.city : '-'}</td>

                                        <td>
                                            <ButtonGroup size="sm" className="mr-2 gap-2">
                                                <Button
                                                    variant="info"
                                                    onClick={() => {
                                                        setEditedFarm(item);
                                                        const selectedIso = item.city?.iso || '';
                                                        setCountry(selectedIso);
                                                        const filteredCities = allCities.filter(city => city.iso === selectedIso);
                                                        setCities(filteredCities);
                                                        setToggle(true);
                                                    }}

                                                >
                                                    <i className="material-icons">&#xe3c9;</i>
                                                </Button>
                                                <Button squared variant="danger" onClick={() => confirmDelete(item.uid)}><i className="material-icons">&#xe872;</i></Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>

            <Modal size="lg" show={toggle} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header>

                    <h6 className="m-0">{t('edit_farm')}</h6>{" "}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px"
                        }}
                    >
                        <Button
                            // theme="success"
                            className="mb-2 mr-1 btn btn-success"
                            onClick={handleEditFarm}
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

                </Modal.Header>
                <Modal.Body>



                    <Form>

                        <Row form className='gap-2 justify-content-between'>
                            <Form.Group as={Col} md="4">
                                <Form.Label>{t('name_farm')} *</Form.Label>
                                <Form.Control

                                    type="text"
                                    placeholder={t('name_farm')}
                                    value={editedFarm.name || ''}

                                    onChange={(e) => setEditedFarm({ ...editedFarm, name: e.target.value })}
                                    style={{ height: "40px" }}
                                />

                            </Form.Group>
                            <Form.Group as={Col} md="3">
                                <Form.Label>{t('group_name')}</Form.Label>
                                <Form.Control

                                    type="text"
                                    placeholder={t('group_name')}
                                    value={editedFarm.name_group}
                                    onChange={(e) => setEditedFarm({ ...editedFarm, name_group: e.target.value })}
                                    style={{ height: "40px" }}

                                />

                            </Form.Group>
                            <Form.Group as={Col} md="4" >
                                <Form.Label>{t('select_country')} *</Form.Label>


                                <Form.Select
                                    onChange={handleCountryPick}
                                    value={country}
                                    required
                                    style={{ height: "40px" }}

                                >
                                    <option value="">{t('select_country')}</option>
                                    {countries.map(country => (
                                        <option key={country.id} value={country.iso}>{country.name}</option>
                                    ))}
                                </Form.Select>


                            </Form.Group>
                        </Row>
                        <Form.Group as={Col} md="6" controlId="validationCustom03" className="mt-2">
                            <Form.Label>{t('select_city')} *</Form.Label>
                            <Form.Select
                                value={editedFarm.city_id}
                                onChange={e => setEditedFarm({ ...editedFarm, city_id: e.target.value })}
                                required
                                style={{ height: "40px" }}


                            >
                                <option value="">{t('select_city')}</option>
                                {cities && cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.city}</option>
                                ))}
                            </Form.Select>

                        </Form.Group>
                    </Form>

                </Modal.Body>
            </Modal>




        </>
    )
}

export default FarmList