import React, {Component} from "react";

export default class Login extends Component {
  state = {
    pass: "",
  };

  onPasswordChange = (e) => {
    this.setState({
      pass: e.target.value,
    });
  };

  render() {
    const {pass} = this.state;
    const {login, lengthErr, loginErr} = this.props;

    let renderLoginErr, renderLengthErr;

    loginErr
      ? (renderLoginErr = (
          <span className="login-error">Incorrect password entered!</span>
        ))
      : null;

    lengthErr
      ? (renderLengthErr = (
          <span className="login-error">
            Password must be at least 6 characters long!
          </span>
        ))
      : null;

    return (
      <div className="login-container">
        <div className="login">
          <h2 className="uk-modal-title uk-text-center">Authorization</h2>

          <div className="uk-margin-top uk-text-lead">Password:</div>

          <input
            id=""
            className="uk-input uk-margin-top"
            type="password"
            name=""
            placeholder="Password"
            value={pass}
            onChange={(e) => this.onPasswordChange(e)}
          />

          {renderLoginErr}
          {renderLengthErr}

          <button
            className="uk-button uk-button-primary uk-margin-top"
            type="button"
            onClick={() => login(pass)}
          >
            LogIn
          </button>
        </div>
      </div>
    );
  }
}
