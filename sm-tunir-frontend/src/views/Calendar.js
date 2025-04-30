import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card  } from 'react-bootstrap'
import PageTitle from "../components/common/PageTitle";
import { useTranslation } from "react-i18next";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/nb";
import api from "../api/api";
import Select from 'react-select';


const localizer = momentLocalizer(moment);

const MyCalendar = props => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true)

  const [events, setEvents] = useState([]);
  const [allCalcul, setAllCalcul] = useState([])
  const [fields, setFields] = useState([])
  const [selectedFields, setSelectedFields] = useState([]);
  const [showAllEvents, setShowAllEvents] = useState(true);


  const handleFieldSelect = (selectedOptions) => {
    setSelectedFields(selectedOptions);
    setShowAllEvents(selectedOptions.length === 0);
  };
  const toHoursAndMinutes = (totalMinutes) => {
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    return `${hours}h ${parseFloat(minutes).toFixed(0)}m`;
  }
  useEffect(() => {
    const getAllCalcul = async () => {
      try {
        const response = await api.get('/calcul/all-calcul')
        const eventData = response.data.calcul;
        setAllCalcul(eventData)
      } catch (error) {
        console.log(error)
      }
    }
    const getDataFields = async () => {
      await api.get('/field/fields').then(res => {
        const newData = res.data.farms;
        let Fields = [];
        newData.map(item => {
          let fields = item.fields
          if (fields) {
            fields.map(itemfield => {
              Fields.push({
                title: itemfield.name,
                status: itemfield.status,
                description: itemfield.description,
                Uid: itemfield.uid,
                farm_id: itemfield.farm_id,
                Latitude: itemfield.Latitude,
                Longitude: itemfield.Longitude,
                Id: itemfield.id
              });
            })
          }
        });
        setFields(Fields)
      })
    }
    getAllCalcul()
    getDataFields()
  }, [])
  // useEffect(()=>{
  //   let data = []
  //   allCalcul && allCalcul.map(event=>{
  //     let startDate = new Date(event.start_date).toISOString().slice(0, 10)
  //     let endDate = new Date(event.end_date).toISOString().slice(0, 10)
  //     let resultCalcul = event.result
  //   const filteredEvents = resultCalcul.filter(result => {
  //     let resultDate = new Date(result.date).toISOString().slice(0, 10)

  //     return result.irrigationNbr === 1 && resultDate >= startDate  && resultDate < endDate

  //   })

  //   filteredEvents && filteredEvents.map(event=>{
  //       data.push({
  //         title: <div style={{fontSize:11.5}}>
  //           <div>
  //             {'Irrigation Dose : ' + parseFloat(event.irrigation).toFixed(2) + ' mm'}
  //           </div>
  //           <div>
  //             {'Irrigation Time : ' + toHoursAndMinutes(event.irrigationTime)}
  //           </div>
  //           <div>
  //             {'Rain : ' + parseFloat(event.rain).toFixed(2) + ' mm'}
  //           </div>
  //         </div>,
  //         allDay: true,
  //         start: new Date(event.date),
  //         end: new Date(event.date),
  //         source:"resultCalcul"

  //       })


  //      })            
  //   })
  //   setEvents(data);
  // },[allCalcul])
  // console.log(fields)

  useEffect(() => {
    let data = [];
    allCalcul &&
      allCalcul.forEach((event) => {
        let startDate = new Date(event.start_date).toISOString().slice(0, 10);
        let endDate = new Date(event.end_date).toISOString().slice(0, 10);
        let resultCalcul = event.result;

        const filteredEvents = resultCalcul.filter((result) => {
          let resultDate = new Date(result.date).toISOString().slice(0, 10);

          return (
            result.irrigationNbr === 1 &&
            resultDate >= startDate &&
            resultDate < endDate &&
            (showAllEvents || selectedFields.some((field) => field.value === event.field_id))
          );
        });

        filteredEvents &&
          filteredEvents.forEach((event) => {
            data.push({
              title: (
                <div style={{ fontSize: 11.5 }}>
                  <div>{'Irrigation Dose : ' + parseFloat(event.irrigation).toFixed(2) + ' mm'}</div>
                  <div>{'Irrigation Time : ' + toHoursAndMinutes(event.irrigationTime)}</div>
                  <div>{'Rain : ' + parseFloat(event.rain).toFixed(2) + ' mm'}</div>
                </div>
              ),
              allDay: true,
              start: new Date(event.date),
              end: new Date(event.date),
              source: "resultCalcul",
            });
          });
      });
    setEvents(data);
  }, [allCalcul, selectedFields]);
  return (
    <Container fluid className="main-content-container p-4">
      <Row noGutters className="page-header py-4">
        <PageTitle
          sm="4"
          title={t('irrigations_schedule')}
          subtitle={t('overview')}
          className="text-sm-left"
        />
      </Row>
      <Row className="py-4 d-flex justify-content-center align-items-center">
        <Col lg='4' md='8' sm='8'>
          <Select
            isMulti
            onChange={handleFieldSelect}
            options={fields.map((field) => ({
              value: field.Id,
              label: field.title,
            }))}
          />

        </Col>
      </Row>
      <Row>
        <Col lg='12' md='12' sm='12'>
          <Card>
            <Card.Body>

              <div style={{ height: 590 }}>
                <Calendar
                  localizer={localizer}
                  culture="en-GB"
                  views={["month", "week"]}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  eventPropGetter={(event, start, end, isSelected) => ({
                    event,
                    start,
                    end,
                    isSelected,
                    style: { backgroundColor: "#26A6B7" }
                  })}
                />
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default MyCalendar;
