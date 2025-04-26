import React, { useState, useEffect } from 'react'
import { Container, Row, Col, FormInput, FormSelect } from 'shards-react'
import { Container, Row, Col, Form } from 'react-bootstrap';

import swal from "sweetalert";
import api from "../api/api"
import AllFields from './AllFields';
import FilteredByStatus from './FilteredByStatus';
import FilteredNoSensor from './FilteredNoSensor'

const FilterFields = ({ fieldStats, sensorsData, filteredByStatus, crops }) => {

    const [farms, setFarms] = useState([]);
    const [fields, setFields] = useState([]);
    const [SearchName, setSearchName] = useState('');
    const [filteredResult, setFilteredResult] = useState([])

    const [value, setValue] = useState('')

    useEffect(() => {
        getAllFields()
    }, [fieldStats])
    const getAllFields = () => {
        let Fields = [];
        fieldStats.map(farm => {
            let fields = farm.fields
            if (fields) {
                fields.map(itemfield => {
                    Fields.push({
                        name: itemfield.name,
                        status: itemfield.status,
                        description: itemfield.description,
                        uid: itemfield.uid,
                        farm_id: itemfield.farm_id,
                        id: itemfield.id,
                        sensors: itemfield.sensors
                    });
                })
            }
        });
        setFields(Fields)
    }




    const searchMethod = () => {

        switch (value) {
            case 'All fields':
                return <AllFields sensorsData={sensorsData} crops={crops} filteredFields={filteredFields} fields={fields} />
            case 'State':
                return <FilteredByStatus sensorsData={sensorsData} crops={crops} value={value} filteredByStatus={filteredByStatus} />
            case 'No sensor':
                return <FilteredNoSensor crops={crops} fields={fields} filteredFields={filteredFields} />
            default: return <AllFields sensorsData={sensorsData} crops={crops} filteredFields={filteredFields} fields={fields} />

        }
    }

    


    const selectSearch = [
        { value: 'All fields', label: 'All fields' },
        { value: 'Critical', label: 'Critical' },
        { value: 'Optimal', label: 'Optimal' },
        { value: 'Full', label: 'Full' },
        { value: 'No sensor', label: 'No sensor' }
    ];

    const filteredFields = fields.filter(field => {
            if(SearchName != ''){
                return (
                    field.name.toLowerCase().includes(SearchName.toLowerCase())

                    )
            }  
            if( value === 'Critical'|| value === 'Optimal' || value === 'Full' ){
                return (
                    field.status === value

                    )
            }  
            return field
        }
    );



    return (
        <Container fluid className="main-content-container px-4 py-4">
            <Row form className="d-flex justify-content-center">
                <Col lg="4" md="6" sm="6" className="mb-4">
                    <FormInput value={SearchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Search by Field Name..." className="mb-2" />
                </Col>
                <Col lg="4" md="6" sm="6" className="mb-4">
                    <FormSelect id='myList' value={value} onChange={(e) => setValue(e.target.value)} className="mb-2">
                        {
                            selectSearch.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))
                        }
                    </FormSelect>
                </Col>
            </Row>
            <Row>
                {searchMethod()}
            </Row>
        </Container>
    )
}

export default FilterFields