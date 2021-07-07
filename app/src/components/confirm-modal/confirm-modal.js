import React from "react";

const ComfirmModal = ({modal, target, method, text}) => {
  const {title, desc, btn} = text;

  return (
    <div id={target} uk-modal={modal.toString()}>
      <div className="uk-modal-dialog uk-modal-body">
        <h2 className="uk-modal-title">{title}</h2>

        <p>{desc}</p>

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
            {btn}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ComfirmModal;
