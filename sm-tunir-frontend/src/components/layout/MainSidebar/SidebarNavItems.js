import React from "react";
import SidebarNavItem from "./SidebarNavItem";
import Sidebar from "./SideBar";
import { Store } from "../../../flux";

class SidebarNavItems extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navItems: Store.getSidebarItems()
    };

    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    Store.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    Store.removeChangeListener(this.onChange);
  }

  onChange() {
    this.setState({
      ...this.state,
      navItems: Store.getSidebarItems()
    });
  }

  render() {
    const { navItems: items } = this.state;
    const {handleToggleSidebar } = this.props;

    return (
      <div className="nav-wrapper">
        {/*<Nav className="nav--no-borders flex-column">
          {items.map((item, idx) => (
            <SidebarNavItem key={idx} item={item} />
          ))}
        </Nav>*/}
        <Sidebar handleToggleSidebar={handleToggleSidebar}/>
      </div>
    );
  }
}

export default SidebarNavItems;
