import React from "react";

const panel = ({method}) => {
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
        uk-toggle="target: #modal-meta"
      >
        Edit META
      </button>

      <button
        className="uk-button uk-button-primary uk-margin-small-right"
        type="button"
        onClick={() => method()}
      >
        Save
      </button>

      <button
        className="uk-button uk-button-default"
        type="button"
        uk-toggle="target: #modal-backup"
      >
        Backup
      </button>
    </div>
  );
};

export default panel;
