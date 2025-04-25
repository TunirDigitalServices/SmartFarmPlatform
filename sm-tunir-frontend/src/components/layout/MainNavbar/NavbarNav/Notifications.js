import React from "react";
// import { NavItem, NavLink, Badge, Collapse, DropdownItem} from "shards-react";
import api from '../../../../api/api'
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import DropdownItem from 'react-bootstrap/DropdownItem';

import { Link } from "react-router-dom";

class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      toggle: false,
      notifs: [],
      notifList: null
    };

    this.toggleNotifications = this.toggleNotifications.bind(this);
  }

  toggleNotifications() {
    this.setState({
      visible: !this.state.visible
    });
  }

  componentDidMount = () => {
    this.getNotifications()
    this.getCalcul()
    setInterval(() => { this.getNotifications() }, 300000)
    //setInterval(()=>{this.getCalcul()},60000)
  }
  getCalcul = async () => {
    await api.post('/calcul/add-sensor-calcul')
      .then(response => {
      }).catch(err => {
        console.log(err)
      })
  }
  getNotifications = async () => {
    await api.get('/notification/notifications')
      .then(response => {
        let notifs = response.data.notifications;
        this.setState({ notifs: notifs })
        this.setState({ notifList: notifs.length })

      }).catch(err => {
        console.log(err)
      })
  }

  markAsRead = (itemUid) => {
    let notification_uid = itemUid

    api.post('/notification/viewed', { notification_uid })
      .then(response => {
        this.getNotifications()
      }).catch(err => {
        console.log(err)
      })
  }


  IconByType = (type) => {
    switch (type) {
      case 'Warning':
        return <i className="material-icons">&#xe002;</i>
      case 'Info':
        return <i className="material-icons">&#xe645;</i>
      case 'Success':
        return <i className="material-icons">&#xE031;</i>
      default:
        break;
    }
  }

  goToAllNotifs = () => {
    this.props.history.push('/notifications')
    window.location.reload()
  }

  render() {
    return (
      <>
        <NavItem className="border-right dropdown notifications">
          <NavLink
            className="nav-link-icon text-center"
            onClick={this.toggleNotifications}
          >
            <div className="nav-link-icon__wrapper">
              <i className="material-icons">&#xE7F4;</i>
              {
                this.state.notifList > 0
                  ?
                  <Badge pill theme="danger">
                    {this.state.notifList}
                  </Badge>
                  :
                  null
              }
            </div>
          </NavLink>
          <Collapse in={this.state.visible}>
  <div className="dropdown-menu dropdown-menu-small">
    {this.state.notifs.length === 0 ? (
      <div>No notifications</div>
    ) : (
        this.state.notifs.map(notif=>{
                     return(
                       <Link onClick={() => this.goToAllNotifs()}> 
     
                       <DropdownItem >
                         <div className=" notification__icon-wrapper">
                           <div className="notification__icon">
                             {this.IconByType(notif.type)}
                           </div>
                         </div>
                         <div  className="notification__content">
                           <span className="notification__category">{notif.object}</span>
                           <p>
                             {notif.description}
                           </p>
                         </div>
                       </DropdownItem>
                       </Link> 
     
                     )
                   })
    )}
    <DropdownItem
      className="notification__all text-center"
      onClick={() => this.goToAllNotifs()}
    >
      View all Notifications
    </DropdownItem>
  </div>
</Collapse>





        </NavItem>
      </>
    );
  }
}

export default Notifications