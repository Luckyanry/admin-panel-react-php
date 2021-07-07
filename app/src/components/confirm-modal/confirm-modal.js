import React from "react";

const ComfirmModal = ({modal, target, method}) => {
  return (
    <div id={target} uk-modal={modal.toString()}>
      <div className="uk-modal-dialog uk-modal-body">
        <h2 className="uk-modal-title">Preservation</h2>

        <p>Are you sure you want to save the changes?</p>

        <p className="uk-text-right">
          <button
            className="uk-button uk-button-default uk-modal-close uk-margin-small-right"
            type="button"
          >
            Cancel
          </button>

          <button
            className="uk-button uk-button-primary uk-modal-close"
            type="button"
            onClick={() => method()}
          >
            Save
          </button>
        </p>
      </div>
    </div>
  );
};

export default ComfirmModal;
