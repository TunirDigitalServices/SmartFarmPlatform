import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';
import api from '../api/api';
import swal from 'sweetalert';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';

const AddUser = () => {

  const navigate = useNavigate()

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [sendEmail, setSendEmail] = useState(false);

  const [nameError, setNameErr] = useState('');
  const [emailError, setEmailErr] = useState('');
  const [mdpError, setPassErr] = useState('');
  const [confMdpErr, setconfMdpErr] = useState('');
  const [offerType, setOfferType] = useState(1);

  const [suppliers, setSuppliers] = useState([]);
  const [supplierUid, setSupplierUid] = useState('');
  const { t, i18n } = useTranslation();

  const validate = () => {
    let nameError = '';
    let emailError = '';
    let mdpError = '';
    let confMdpErr = '';

    if (!name) {
      nameError = 'Username cannot be blank!';
      setNameErr(nameError);
    }
    if (!email) {
      emailError = 'Email cannot be blank!';
      setEmailErr(emailError);
    } else if (typeof email !== 'undefined') {
      var mailformat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!mailformat.test(email)) {
        emailError = 'Incorrect email format!';
        setEmailErr(emailError);
      }
    }
    if (password.length < 6) {
      mdpError = 'Password cannot be less than 6 characters!';
      setPassErr(mdpError);
    }
    if (password !== confirmPass) {
      confMdpErr = `Passwords don't match`;
      setconfMdpErr(confMdpErr);
    }
    if (emailError || nameError || mdpError || confMdpErr) {
      setEmailErr(emailError);
      setNameErr(nameError);
      setPassErr(mdpError);
      setconfMdpErr(confMdpErr);
      return false;
    }
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = validate();
    if (isValid) {
      handleRegister();
    } else {
      return false;
    }
  };

  const handleRegister = () => {
    let data = {
      name: name,
      email: email,
      password: password,
      confirmPassword: confirmPass,
      offer_type: offerType,
      supplier_uid: supplierUid,
    };

    api
      .post('/admin/add-user', data)
      .then((res) => {
        if (res.data.type && res.data.type === 'danger') {
          swal({
            icon: 'error',
            title: 'Oops...',
            text: res.data.message,
          });
          return false;
        }
        if (res.data.type && res.data.type === 'warning') {
          swal({
            icon: 'warning',
            title: 'Oops...',
            text: res.data.message,
          });
          setSendEmail(true, resetForm());
        }
        if (res.data.type && res.data.type === 'success') {
          swal({
            icon: 'success',
            title: 'OK',
            text: 'Email sent, check your inbox to confirm',
          });
          setSendEmail(true, resetForm());
        }
      })
      .catch(() => {
        swal({
          icon: 'error',
          title: 'Oops...',
          text: 'error_add_user',
        });
        return false;
      });
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPass('');
    setOfferType(1);

    setTimeout(() => {
      setSendEmail(false);
    }, 3000);
  };

  useEffect(() => {
    getSuppliers();
  }, []);

  const getSuppliers = async () => {
    await api
      .get('/admin/suppliers')
      .then((response) => {
        let suppliersList = response.data.suppliers;
        setSuppliers(suppliersList);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Container fluid className="main-content-container py-4">
        <Card>
          <CardContent>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: 'auto',
                float: 'left',
              }}
            >
              <div>
                <h6 className="m-0" style={{ textAlign: 'left' }}>
                  Add User
                </h6>{' '}
              </div>
            </div>
          </CardContent>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item lg={6} md={12} sm={12}>
                <FormControl fullWidth size='small' >
                  <TextField
                    label="Username"
                    placeholder="Name"
                    variant="outlined"
                    size='small'
                    error={!!nameError}
                    helperText={nameError}
                    value={name}
                    color="primary" 
                    focused                  
                      onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth size='small'>
                  <TextField
                    label="Email"
                    placeholder="Email"
                    variant="outlined"
                    className='my-3'
                    type="email"
                    size='small'
                    error={!!emailError}
                    helperText={emailError}
                    value={email}
                    color="primary" 
                    focused  
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl fullWidth size='small'>
                  <TextField
                    label="Password"
                    placeholder="Password"
                    variant="outlined"
                    size='small'
                    type={showPassword ? 'text' : 'password'}
                    error={!!mdpError}
                    helperText={mdpError}
                    value={password}
                    color="primary" 
                    focused  
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
                <FormControl fullWidth size='small'>
                  <TextField
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    className='my-3'
                    variant="outlined"
                    size='small'
                    type={showPassword ? 'text' : 'password'}
                    error={!!confMdpErr}
                    helperText={confMdpErr}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    color="primary" 
                    focused  

                  />
                </FormControl>
              </Grid>
              <Grid item lg={6} md={12} sm={12}>
                <FormControl fullWidth size='small' className='mb-3'>
                  <InputLabel id="offer-label">Offer type</InputLabel>
                  <Select
                    labelId="offer-label"
                    value={offerType}
                    label="Offer type"
                    onChange={(e) => setOfferType(e.target.value)}
                  >
                    <MenuItem value={1}>{t('gratuit')}</MenuItem>
                    <MenuItem value={2}>{t('payante')}</MenuItem>
                  </Select>
                </FormControl>
                <div className="border p-4">
                  <div className="p-2 m-2">
                    <i className="material-icons">&#xe88e;</i>
                    You can assign this user to a Supplier Account
                  </div>
                  <FormControl fullWidth size='small'>
                    <InputLabel id="supplier-label">Select Supplier</InputLabel>
                    <Select
                      labelId="supplier-label"
                      value={supplierUid}
                      onChange={(e) => setSupplierUid(e.target.value)}
                    >
                      <MenuItem value="">Select Supplier</MenuItem>
                      {suppliers.map((supplier) => (
                        <MenuItem key={supplier.uid} value={supplier.uid}>
                          {supplier.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
            </Grid>
          </CardContent>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px',gap:"10px" }}>
          <Button
                variant="success"
                className="mb-2 mr-1"
                onClick={handleSubmit}
              >
                <i className={`fa fa-check mx-2`}></i>
                Save
              </Button>
              <Button
                variant="danger"
                onClick={() => navigate('/admin/users')}
                className="mb-2 mr-1"
              >
                <i className={`fa fa-times mx-2`}></i>
                Cancel
              </Button>
          </div>
        </Card>
      </Container>
    </>
  );
};

export default AddUser;
