import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, CardBody, CardHeader, Button, Form, FormCheckbox,FormInput, FormGroup, FormSelect, ButtonGroup, Modal, ModalBody, ModalHeader } from "shards-react";
import { useTranslation } from "react-i18next";
import api from '../api/api';
import moment from 'moment'

const PlanningList = ({equipmentData,planningList}) => {
    
    const { t, i18n } = useTranslation();

        const [checked,setIsChecked] = useState(true)

    return (
        <>
            <table className="table mb-0 text-center">
                <thead className="bg-light">
                    <tr>
                        <th scope="col" className="border-0">{t('Device')}</th>
                        <th scope="col" className="border-0">{t('Start date')}</th>
                        <th scope="col" className="border-0">{t('End date')}</th>
                        <th scope="col" className="border-0">{t('Sunday')}</th>
                        <th scope="col" className="border-0">{t('Monday')}</th>
                        <th scope="col" className="border-0">{t('Tuesday')}</th>
                        <th scope="col" className="border-0">{t('Wednesday')}</th>
                        <th scope="col" className="border-0">{t('Thursday')}</th>
                        <th scope="col" className="border-0">{t('Friday')}</th>
                        <th scope="col" className="border-0">{t('Saturday')}</th>

                        <th scope="col" className="border-0"></th>

                    </tr>
                </thead>
                <tbody>
        {
           planningList && planningList.map((item,indx) => {
            let equipName = ''
               let startDate = moment(item.start_date).format("MMM Do YYYY"); 
               let endDate = moment(item.end_date).format("MMM Do YYYY"); 
               equipmentData.map(equip=>{
                if (equip.id === item.equipment_id){
                    equipName = equip.name
                }
               })
                    let checkedDays = JSON.parse(item.days)
                        

              return (
                                <tr>
                                    <td>{equipName}</td>
                                    <td>{startDate}</td>
                                    <td>{endDate}</td>
                                    <td><input type="checkbox" name="" id="" /></td>
                                    <td><input  type="checkbox" name="" id="" /></td>
                                    <td><input type="checkbox" name="" id="" /></td>
                                    <td><input  type="checkbox" name="" id="" /></td>
                                    <td><input  type="checkbox" name="" id="" /></td>
                                    <td><input  type="checkbox" name="" id="" /></td>
                                    <td><input type="checkbox" name="" id="" /></td>

                                    <td>
                                        <ButtonGroup size="sm" className="mr-2">
                                            <Button onClick={() => {}} squared><i className="material-icons">&#xe3c9;</i></Button>
                                            <Button onClick={() => {}} squared theme="danger"><i className="material-icons">&#xe872;</i></Button>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                
            )
        })
        }
                    
    

                </tbody>
            </table>
        
        </>
    )
}

export default PlanningList