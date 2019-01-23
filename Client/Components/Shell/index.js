import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Header from './Header';
import Sidebar from './Sidebar';

class Shell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSidebarOpen: true
    };
  }

  sidebarToggle = () => {
    this.setState(state => ({ isSidebarOpen: !state.isSidebarOpen }));
  };

  render() {
    const { isSidebarOpen } = this.state;
    const { children } = this.props;

    return (
      <Grid fluid={true}>
        <Row>
          <Col>
            <Header sidebarToggle={this.sidebarToggle} />
          </Col>
        </Row>
        <Row className="sidebar-main-wrap">
          <Sidebar show={isSidebarOpen} />
          <main className="main-content">{children}</main>
        </Row>
      </Grid>
    );
  }
}

export default Shell;
