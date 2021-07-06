import React from "react";
import UIkit from "uikit";

const panel = ({method}) => {
  const savePageHandler = () => {
    method(
      () => {
        UIkit.notification({
          message: "Successfully saved",
          status: "success",
        });
      },
      () => {
        UIkit.notification({
          message: "Changes not saved!",
          status: "danger",
        });
      }
    );
  };

  return (
    <div className="panel">
      <button
        className="uk-button uk-button-primary uk-margin-small-right"
        type="button"
        uk-toggle="target: #modal-open"
      >
        Select page
      </button>

      <button
        className="uk-button uk-button-primary uk-margin-small-right"
        type="button"
        uk-toggle="target: #modal-save"
      >
        Publish
      </button>

      <button
        className="uk-button uk-button-primary uk-margin-small-right"
        type="button"
        onClick={() => savePageHandler()}
      >
        Save
      </button>

      <button
        className="uk-button uk-button-default"
        type="button"
        uk-toggle="target: #modal-backup"
      >
        Restore
      </button>
    </div>
  );
};

export default panel;
