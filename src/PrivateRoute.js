import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import AuthContext from './AuthContext';

const PrivateRoute = ({ component: Component, scopes, ...rest }) => {
  return (
    <AuthContext.Consumer>
      {auth => (
        <Route
          {...rest}
          render={props => {
            if (!auth.isAuthenticated()) return auth.login();

            if (scopes.length && !auth.userHasScopes(scopes)) {
              return (
                <h1>
                  Unauthorized - You need the following scopes to view this page
                  : {scopes.join(',')}
                </h1>
              );
            }
            return <Component auth={auth} {...props} />;
          }}
        />
      )}
    </AuthContext.Consumer>
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  scopes: PropTypes.array
};

PrivateRoute.defaultProps = {
  scopes: []
};
export default PrivateRoute;
