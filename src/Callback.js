import React, { useEffect } from 'react';

const Callback = props => {
  useEffect(() => {
    if (/access_token|id_token|error/.test(props.location.hash)) {
      props.auth.handleAuthentication();
    } else {
      throw new Error('invalid callback URL');
    }
  });

  return <div />;
};

export default Callback;
