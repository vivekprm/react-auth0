import React, { Component } from "react";
import { Link } from "react-router-dom";

class Home extends Component {
  render() {
    const { isAuthenticated, login } = this.props.auth;
    return (
      <div>
        <h1>Home</h1>
        {isAuthenticated() ? (
          <Link to="/prfile">View Profile</Link>
        ) : (
          <button onClick={login}>Login</button>
        )}
      </div>
    );
  }
}

export default Home;
