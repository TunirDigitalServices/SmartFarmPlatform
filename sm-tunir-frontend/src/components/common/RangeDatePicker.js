import React, { useEffect } from "react";
import classNames from "classnames";
// import {
//   InputGroup,
//   DatePicker,
//   InputGroupAddon,
//   InputGroupText
// } from "shards-react";
import { InputGroup, FormControl, InputGroupText } from 'react-bootstrap';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css'; 


import "../../assets/styling/range-date-picker.css";

class RangeDatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startDate: new Date().setHours('00', '01', '00'),
      endDate: new Date().setHours('00', '00', '00')
    };

    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
  }

  handleStartDateChange(value) {
    this.setState(
      {
        ...this.state,
        ...{ startDate: new Date(value) }
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange({
            startDate: this.state.startDate,
            endDate: this.state.endDate
          });
        }
      }
    );
  }

  handleEndDateChange(value) {
    this.setState(
      {
        ...this.state,
        ...{ endDate: new Date(value) }
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange({
            startDate: this.state.startDate,
            endDate: this.state.endDate
          });
        }
      }
    );
  }

  render() {
    const {
      className,
      StartingDatePlaceHolder,
      EndingDatePlaceHolder, 
      selected, 
    } = this.props;
    const classes = classNames(className, "d-flex", "my-auto", "date-range");

    return (
      <InputGroup className={classes}>
        <DatePicker
          size="md"
          selected={this.state.startDate}
          onChange={this.handleStartDateChange}
          placeholderText={StartingDatePlaceHolder}
          dropdownMode="select"
          className="text-center"
        />
        <DatePicker
          size="md"
          selected={this.state.endDate}
          onChange={this.handleEndDateChange}
          placeholderText={EndingDatePlaceHolder}
          dropdownMode="select"
          className="text-center"
        />
        <InputGroup.Text type="append">
          <InputGroup.Text>
            <i className="material-icons">&#xE916;</i>
          </InputGroup.Text>
        </InputGroup.Text>
      </InputGroup>
    );
  }
}

export default RangeDatePicker;
