import React, { useState, useEffect } from 'react';

import { Container, Card, CardContent, TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import swal from 'sweetalert';
import { useTranslation } from "react-i18next";
import api from '../api/api';
import countryState from '../data/gistfile.json';
import {Button, Col, Row} from 'react-bootstrap' 
import { useNavigate } from 'react-router';
const AddSupplier = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate()

  const [allCountry, setAllCountry] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setAddress('');
    setMobilePhone('');
    setCountry('');
    setCity('');
  };

  const isValid = () => {
   
    return name && email  && mobilePhone;
  };
  

  const addSupplier = () => {
    if (!isValid()) {
      swal({
        icon: 'error',
        title: 'Error',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    let data = {
      name: name,
      address: address,
      tel_mobile: mobilePhone,
      city: city,
      country: country,
    };

    api.post('/supplier/add-supplier', data)
      .then(response => {
        if (response.data.type && response.data.type === 'success') {
          swal({
            icon: 'success',
            title: 'OK',
            text: 'Supplier added',
          });
          resetForm();
        }
      })
      .catch(err => {
        swal({
          icon: 'error',
          title: 'Error',
        });
      });
  };

  useEffect(() => {
    let listcountry = [];
    countryState.countries.map((item, indx) => {
      listcountry.push(item.country);
    });
    setAllCountry(listcountry);
  }, []);

  const handleCountry = async (country) => {
    setCountry(country);
    let liststateSelectedCountry = [];
    allCountry.map((item, indx) => {
      if (item === country) {
        countryState.countries[indx].states.map((state, i) => {
          liststateSelectedCountry.push(state);
        });
      }
    });
    setAllStates(liststateSelectedCountry);
  };

  return (
    <>
      <Container fluid className="main-content-container py-4">
        <Card>
          <CardContent>
            
              <Row className='px-4 border-bottom my-3'>
                <h6 >Supplier Information</h6>
              </Row>
            <Row className='mt-4 gap-2'>
              <Col lg='6' md='12' sm='12'>
                <TextField
                  label="Supplier Company Name"
                  placeholder="Supplier Company Name"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  size='small'
                  color="primary" 
                  focused    

                />
                <TextField
                  label="Email"
                  placeholder="Email"
                  fullWidth
                  type="email"
                  size='small'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='my-3'
                  color="primary" 
                  focused    

                />
                <TextField
                  label="Phone Number"
                  placeholder="Phone Number"
                  fullWidth
                  size='small'
                  type="tel"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  required
                  color="primary" 
                  focused    

                />
              </Col>
              <Col lg='5' md='12' sm='12'>
                <TextField
                  label="Address"
                  fullWidth
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  size='small' 
                />
                <FormControl  className='my-3' size='small' fullWidth>
                  <InputLabel htmlFor="country">{t('Country')}</InputLabel>
                  <Select
                    value={country}
                    onChange={(e) => handleCountry(e.target.value)}
                    inputProps={{
                      name: 'country',
                      id: 'country',
                    }}

                  >
                    <MenuItem value="" disabled>Select Country</MenuItem>
                    {allCountry.map((country, i) => (
                      <MenuItem key={i} value={country}>{country}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size='small'  fullWidth >
                  <InputLabel htmlFor="city">{t('City')}</InputLabel>
                  <Select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    inputProps={{
                      name: 'city',
                      id: 'city',
                    }}
                  >
                    <MenuItem value="" disabled>Select City</MenuItem>
                    {allStates.map((state, i) => (
                      <MenuItem key={i} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Col>
            </Row>
          </CardContent>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
            <Button  variant="success" onClick={addSupplier}>
              Save
            </Button>
            <Button className='mx-2' variant="danger" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
          </div>
        </Card>
      </Container>
    </>
  );
};

export default AddSupplier;
