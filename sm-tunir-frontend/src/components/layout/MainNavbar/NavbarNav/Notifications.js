import React, { useState, useEffect, useCallback } from "react";
import api from '../../../../api/api';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Badge from 'react-bootstrap/Badge';
import Collapse from 'react-bootstrap/Collapse';
import DropdownItem from 'react-bootstrap/DropdownItem';
import { Link, useNavigate } from "react-router-dom";

const Notifications = () => {
  const [visible, setVisible] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifList, setNotifList] = useState(null);
  const navigate = useNavigate();

  const toggleNotifications = () => {
    setVisible(!visible);
  };

  const getCalcul = useCallback(async () => {
    try {
      await api.post('/calcul/add-sensor-calcul');
    } catch (err) {
      console.log(err);
    }
  }, []);

  const getNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notification/notifications');
      const notifications = response.data.notifications;
      setNotifs(notifications);
      setNotifList(notifications.length);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    getNotifications();
    getCalcul();
    const interval = setInterval(() => {
      getNotifications();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [getNotifications, getCalcul]);

  const markAsRead = async (itemUid) => {
    try {
      await api.post('/notification/viewed', { notification_uid: itemUid });
      getNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const IconByType = (type) => {
    switch (type) {
      case 'Warning':
        return <i className="material-icons">&#xe002;</i>;
      case 'Info':
        return <i className="material-icons">&#xe645;</i>;
      case 'Success':
        return <i className="material-icons">&#xE031;</i>;
      default:
        return null;
    }
  };

  const goToAllNotifs = () => {
    navigate('/notifications');
    window.location.reload(); // If this isn't required, consider removing it for better UX
  };

  return (
    <NavItem className="border-right dropdown notifications">
      <NavLink
        className="nav-link-icon text-center"
        onClick={toggleNotifications}
      >
        <div className="nav-link-icon__wrapper">
          <i className="material-icons">&#xE7F4;</i>
          {notifList > 0 && (
            <Badge pill bg="danger">
              {notifList}
            </Badge>
          )}
        </div>
      </NavLink>
      <Collapse in={visible}>
        <div className="dropdown-menu dropdown-menu-small">
          {notifs.length === 0 ? (
            <div className="text-muted m-4">No notifications</div>
          ) : (
            notifs.map((notif, idx) => (
              <Link to="#" key={idx} onClick={goToAllNotifs}>
                <DropdownItem>
                  <div className="notification__icon-wrapper">
                    <div className="notification__icon">
                      {IconByType(notif.type)}
                    </div>
                  </div>
                  <div className="notification__content">
                    <span className="notification__category">{notif.object}</span>
                    <p>{notif.description}</p>
                  </div>
                </DropdownItem>
              </Link>
            ))
          )}
          <DropdownItem
            className="notification__all text-center"
            onClick={goToAllNotifs}
          >
           {notifs.length != 0 ? "View all Notifications":""}
          </DropdownItem>
        </div>
      </Collapse>
    </NavItem>
  );
};

export default Notifications;
