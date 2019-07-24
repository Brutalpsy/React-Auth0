import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import Navigation from './Navigation';
import Auth from './Auth/Auth';
import Callback from './Callback';
import Public from './Public';
import Private from './Private';
import Courses from './Courses';
import PrivateRoute from './PrivateRoute';
import AuthContext from './AuthContext';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: new Auth(this.props.history),
      tokenRenewalComplete: false
    };
  }
  componentDidMount() {
    this.state.auth.renewToken(() => {
      this.setState({
        tokenRenewalComplete: true
      });
    });
  }

  render() {
    const { auth } = this.state;
    if (!this.state.tokenRenewalComplete) return 'Loading...';
    return (
      <AuthContext.Provider value={auth}>
        <Navigation auth={auth} />
        <div className="body">
          <Route
            path="/"
            exact
            render={props => <Home auth={auth} {...props} />}
          />
          <PrivateRoute path="/profile" component={Profile} />
          <Route
            path="/callback"
            render={props => <Callback {...props} auth={auth} />}
          />
          <Route path="/public" component={Public} />
          <PrivateRoute path="/private" component={Private} />
          <PrivateRoute
            path="/courses"
            component={Courses}
            auth={auth}
            scopes={['read:courses']}
          />
        </div>
      </AuthContext.Provider>
    );
  }
}

export default App;
