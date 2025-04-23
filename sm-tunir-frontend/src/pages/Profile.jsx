import React, { useState } from 'react';
import {
    MDBCol,
    MDBContainer,
    MDBRow,
    MDBCard,
    MDBCardText,
    MDBCardBody,
    MDBCardImage,
    MDBBtn,
    MDBBreadcrumb,
    MDBBreadcrumbItem,
    MDBProgress,
    MDBProgressBar,
    MDBIcon,
    MDBListGroup,
    MDBListGroupItem
} from 'mdb-react-ui-kit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import bechir from "../assets/images/avatars/bechir.jpg"
import { FaPen, FaTimes } from 'react-icons/fa';
import { countries, cities } from '../constants/CountriesAndCities'


export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);

    const [user, setUser] = useState({
        name: "Bechir Ben Brika",
        email: "bechir@example.com",
        phone: "+216 71 123 456",
        mobile: "+216 98 765 432",
        country: "Tunisia",
        role: "Consultant ERP Odoo",
        description: "Founder & CEO at Smart Soft PRO",
        city: "Tunis",
        zip: "1002",
        image: bechir,
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setUser({ ...user, image: null });
    };
    return (
        <section style={{ backgroundColor: '#eee30' }}>
            <MDBContainer className="py-5">
                {/* <MDBRow>
          <MDBCol>
            <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4">
              <MDBBreadcrumbItem>
                <a href='#'>Home</a>
              </MDBBreadcrumbItem>
              <MDBBreadcrumbItem>
                <a href="#">User</a>
              </MDBBreadcrumbItem>
              <MDBBreadcrumbItem active>User Profile</MDBBreadcrumbItem>
            </MDBBreadcrumb>
          </MDBCol>
        </MDBRow> */}

                <MDBRow>
                    <MDBCol lg="4">
                        <MDBCard className="mb-4">
                            <MDBCardBody className="text-center position-relative">

                                <div className="position-relative d-inline-block" style={{ width: "150px", height: "150px" }}>
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt="avatar"
                                            className="rounded-circle"
                                            style={{ width: "150px", height: "150px", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle  d-flex bg-light align-items-center justify-content-center"
                                            style={{ width: "150px", height: "150px" }}
                                        >
                                            <AccountCircleIcon style={{ fontSize: 80, color: "#aaa" }} />
                                        </div>
                                    )}


                                    {isEditingAvatar && (
                                        <>

                                            <label
                                                htmlFor="imageUpload"
                                                className="position-absolute bottom-0 end-0 rounded-circle"
                                                style={{
                                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                                    width: "36px",
                                                    height: "36px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                                                }}
                                            >
                                                <FaPen size={14} color="#fff" />
                                            </label>
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: "none" }}
                                            />


                                            {user.image && (
                                                <button
                                                    onClick={removeImage}
                                                    className="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle"
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        padding: 0,
                                                        lineHeight: "0",
                                                        fontSize: "14px",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                                                    }}

                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Role */}
                                {isEditingAvatar ? (
                                    <input
                                        className="form-control mt-4 mb-2"
                                        value={user.role}
                                        onChange={(e) => setUser({ ...user, role: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-muted mb-1 mt-4">{user.role}</p>
                                )}

                                {/* Description */}
                                {isEditingAvatar ? (
                                    <input
                                        className="form-control mb-3"
                                        value={user.description}
                                        onChange={(e) => setUser({ ...user, description: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-muted mb-4">{user.description}</p>
                                )}

                                <div className="d-flex justify-content-center mt-3">
                                    {isEditingAvatar ? (
                                        <>
                                            <button
                                                className="btn btn-primary me-2 "
                                                onClick={() => {
                                                    setIsEditingAvatar(false);
                                                }}


                                            >
                                                Save
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => setIsEditingAvatar(false)}>
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => setIsEditingAvatar(true)}>
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </MDBCardBody>
                        </MDBCard>

                        <MDBCard className="mb-4 mb-lg-0 d-flex justify-content-center">
                            <MDBCardBody className="p-0 ">
                                <MDBListGroup flush className="rounded-3 ">
                                    <MDBListGroupItem className="d-flex justify-content-start gap-5 align-items-center p-3">
                                        <MDBIcon fas icon="globe fa-lg text-warning" />
                                        <MDBCardText>
                                            <a href="https://smartsoftpro.com" target="_blank" rel="noopener noreferrer">
                                                smartsoftpro.com
                                            </a>
                                        </MDBCardText>
                                    </MDBListGroupItem>

                                    <MDBListGroupItem className="d-flex justify-content-start gap-5 align-items-center p-3">
                                        <MDBIcon fab icon="github fa-lg" style={{ color: '#333333' }} />
                                        <MDBCardText>
                                            <a href="https://github.com/bechirbenbrika" target="_blank" rel="noopener noreferrer">
                                                bechirbenbrika
                                            </a>
                                        </MDBCardText>
                                    </MDBListGroupItem>

                                    <MDBListGroupItem className="d-flex justify-content-start gap-5 align-items-center p-3">
                                        <MDBIcon fab icon="twitter fa-lg" style={{ color: '#55acee' }} />
                                        <MDBCardText>
                                            <a href="https://twitter.com/bechirbrika" target="_blank" rel="noopener noreferrer">
                                                @bechirbrika
                                            </a>
                                        </MDBCardText>
                                    </MDBListGroupItem>

                                    <MDBListGroupItem className="d-flex justify-content-start gap-5 align-items-center p-3">
                                        <MDBIcon fab icon="instagram fa-lg" style={{ color: '#ac2bac' }} />
                                        <MDBCardText>
                                            <a href="https://instagram.com/bechir.ben.brika" target="_blank" rel="noopener noreferrer">
                                                @bechir.ben.brika
                                            </a>
                                        </MDBCardText>
                                    </MDBListGroupItem>

                                    <MDBListGroupItem className="d-flex justify-content-start gap-5 align-items-center p-3">
                                        <MDBIcon fab icon="facebook fa-lg" style={{ color: '#3b5998' }} />
                                        <MDBCardText>
                                            <a href="https://facebook.com/bechir.benbrika" target="_blank" rel="noopener noreferrer">
                                                bechir.benbrika
                                            </a>
                                        </MDBCardText>
                                    </MDBListGroupItem>
                                </MDBListGroup>
                            </MDBCardBody>

                        </MDBCard>
                    </MDBCol>
                    <MDBCol lg="8">
                        <MDBCard className="mb-4">
                            <MDBCardBody>
                                {/* Full Name */}
                                <MDBRow>
                                    <MDBCol sm="3">
                                        <MDBCardText>Full Name</MDBCardText>
                                    </MDBCol>
                                    <MDBCol sm="9">
                                        {isEditing ? (
                                            <input
                                                className="form-control"
                                                value={user.name}
                                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                                            />
                                        ) : (
                                            <MDBCardText className="text-muted">{user.name}</MDBCardText>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <hr />

                                {/* Email */}
                                <MDBRow>
                                    <MDBCol sm="3">
                                        <MDBCardText>Email</MDBCardText>
                                    </MDBCol>
                                    <MDBCol sm="9">
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={user.email}
                                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                            />
                                        ) : (
                                            <MDBCardText className="text-muted">{user.email}</MDBCardText>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <hr />

                                {/* Phone */}
                                <MDBRow>
                                    <MDBCol sm="3">
                                        <MDBCardText>Phone</MDBCardText>
                                    </MDBCol>
                                    <MDBCol sm="9">
                                        {isEditing ? (
                                            <input
                                                className="form-control"
                                                value={user.phone}
                                                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                            />
                                        ) : (
                                            <MDBCardText className="text-muted">{user.phone}</MDBCardText>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <hr />

                                {/* Mobile */}
                                <MDBRow>
                                    <MDBCol sm="3">
                                        <MDBCardText>Mobile</MDBCardText>
                                    </MDBCol>
                                    <MDBCol sm="9">
                                        {isEditing ? (
                                            <input
                                                className="form-control"
                                                value={user.mobile}
                                                onChange={(e) => setUser({ ...user, mobile: e.target.value })}
                                            />
                                        ) : (
                                            <MDBCardText className="text-muted">{user.mobile}</MDBCardText>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <hr />


                                <MDBRow>
                                    <MDBCol sm="3">
                                        <MDBCardText>Country</MDBCardText>
                                    </MDBCol>
                                    <MDBCol sm="9">
                                        {isEditing ? (
                                            <select
                                                className="form-select"
                                                value={user.country}
                                                onChange={(e) => {
                                                    const selectedCountry = e.target.value;
                                                    setUser({
                                                        ...user,
                                                        country: selectedCountry,
                                                        city: cities[selectedCountry][0]
                                                    });
                                                }}
                                            >
                                                {countries.map((country) => (
                                                    <option key={country} value={country}>
                                                        {country}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <MDBCardText className="text-muted">{user.country}</MDBCardText>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <hr />

                                {/* City */}
                                <MDBRow>
                                    <MDBCol sm="3">
                                        <MDBCardText>City</MDBCardText>
                                    </MDBCol>
                                    <MDBCol sm="9">
                                        {isEditing ? (
                                            <select
                                                className="form-select"
                                                value={user.city}
                                                onChange={(e) => setUser({ ...user, city: e.target.value })}
                                            >
                                                {(cities[user.country] || []).map((city) => (
                                                    <option key={city} value={city}>
                                                        {city}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <MDBCardText className="text-muted">{user.city}</MDBCardText>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <hr />

                                {/* ZIP Code */}
                                <MDBRow>
                                    <MDBCol sm="3">
                                        <MDBCardText>ZIP Code</MDBCardText>
                                    </MDBCol>
                                    <MDBCol sm="9">
                                        {isEditing ? (
                                            <input
                                                className="form-control"
                                                value={user.zip}
                                                onChange={(e) => setUser({ ...user, zip: e.target.value })}
                                            />
                                        ) : (
                                            <MDBCardText className="text-muted">{user.zip}</MDBCardText>
                                        )}
                                    </MDBCol>
                                </MDBRow>
                                <div className="d-flex justify-content-end mt-3">
                                    {isEditing ? (
                                        <>
                                            <button
                                                className="btn btn-primary me-2 "
                                                onClick={() => {
                                                    setIsEditing(false);
                                                }}


                                            >
                                                Save
                                            </button>
                                            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                            Edit
                                        </button>
                                    )}
                                </div>

                            </MDBCardBody>


                        </MDBCard>

                        <MDBRow>
                            <MDBCol md="6">
                                <MDBCard className="mb-4 mb-md-0">
                                    <MDBCardBody>
                                        <MDBCardText className="mb-4"><span className="text-primary font-italic me-1">assigment</span> Project Status</MDBCardText>
                                        <MDBCardText className="mb-1" style={{ fontSize: '.77rem' }}>Web Design</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={80} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>Website Markup</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={72} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>One Page</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={89} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>Mobile Template</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={55} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>Backend API</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={66} valuemin={0} valuemax={100} />
                                        </MDBProgress>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>

                            <MDBCol md="6">
                                <MDBCard className="mb-4 mb-md-0">
                                    <MDBCardBody>
                                        <MDBCardText className="mb-4"><span className="text-primary font-italic me-1">assigment</span> Project Status</MDBCardText>
                                        <MDBCardText className="mb-1" style={{ fontSize: '.77rem' }}>Web Design</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={80} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>Website Markup</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={72} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>One Page</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={89} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>Mobile Template</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={55} valuemin={0} valuemax={100} />
                                        </MDBProgress>

                                        <MDBCardText className="mt-4 mb-1" style={{ fontSize: '.77rem' }}>Backend API</MDBCardText>
                                        <MDBProgress className="rounded">
                                            <MDBProgressBar width={66} valuemin={0} valuemax={100} />
                                        </MDBProgress>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        </section>
    );
}