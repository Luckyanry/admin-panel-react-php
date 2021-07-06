import React, {Component} from "react";
import axios from "axios";
import UIkit from "uikit";

import "../../helpers/iframeLoader";
import DOMHelper from "../../helpers/dom-helper";

import EditorText from "../editor-text/editor-text";
import Spinner from "../spinner/spinner";

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      newPageName: "",
      loading: true,
    };

    this.createNewPage = this.createNewPage.bind(this);
    this.isLoading = this.isLoading.bind(this);
    this.isLoaded = this.isLoaded.bind(this);
  }

  componentDidMount() {
    this.init(this.currentPage);
  }

  init(page) {
    this.iframe = document.querySelector("iframe");
    this.open(page, this.isLoaded);
    this.loadPageList();
  }

  open(page, cb) {
    this.currentPage = page;

    axios
      .get(`../${page}?rnd=${Math.random()}`)
      .then((res) => DOMHelper.parseStrToDOM(res.data))
      .then(DOMHelper.wrapTextNodes)
      .then((dom) => {
        this.virtualDom = dom;
        return dom;
      })
      .then(DOMHelper.serializeDOMToString)
      .then((html) => axios.post("./api/saveTempPage.php", {html}))
      .then(() => this.iframe.load("../temp.html"))
      .then(() => this.enableEditing())
      .then(() => this.injectStyles())
      .then(cb);
  }

  save(onSuccess, onError) {
    this.isLoading();
    const newDom = this.virtualDom.cloneNode(this.virtualDom);

    DOMHelper.unwrapTextNodes(newDom);
    const html = DOMHelper.serializeDOMToString(newDom);

    axios
      .post("./api/savePage.php", {pageName: this.currentPage, html})
      .then(onSuccess)
      .catch(onError)
      .finally(this.isLoaded);
  }

  enableEditing() {
    this.iframe.contentDocument.body
      .querySelectorAll("text-editor")
      .forEach((elem) => {
        const id = elem.getAttribute("nodeid");
        const virtualElement = this.virtualDom.body.querySelector(
          `[nodeid="${id}"]`
        );

        new EditorText(elem, virtualElement);
      });
  }

  injectStyles() {
    const style = this.iframe.contentDocument.createElement("style");
    style.innerHTML = `
      text-editor:hover {
        outline: 3px solid orange;
        outline-offset: 8px;
      }

      text-editor:focus {
        outline: 3px solid red;
        outline-offset: 8px;
      }
    `;

    this.iframe.contentDocument.head.appendChild(style);
  }

  loadPageList() {
    axios.get("./api").then((res) => this.setState({pageList: res.data}));
  }

  createNewPage() {
    axios
      .post("./api/createNewPage.php", {name: this.state.newPageName})
      .then(this.loadPageList())
      .catch(() => alert("The page already exists!"));
  }

  deletePage(page) {
    axios
      .post("./api/deletePage.php", {name: page})
      .then(this.loadPageList())
      .catch(() => alert("Page not found!"));
  }

  isLoading() {
    this.setState({loading: true});
  }

  isLoaded() {
    this.setState({
      loading: false,
    });
  }

  render() {
    const {loading} = this.state;
    const modal = true;
    let spinner;

    loading ? (spinner = <Spinner active />) : <Spinner />;

    return (
      <>
        <iframe src={this.currentPage} frameBorder="0"></iframe>

        {spinner}

        <div className="panel">
          <button
            className="uk-button uk-button-primary"
            type="button"
            uk-toggle="target: #modal-save"
          >
            Publish
          </button>

          <button
            className="uk-button uk-button-primary"
            type="button"
            onClick={() =>
              this.save(
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
              )
            }
          >
            Save
          </button>
        </div>

        <div id="modal-save" uk-modal={modal.toString()}>
          <div className="uk-modal-dialog uk-modal-body">
            <h2 className="uk-modal-title">Preservation</h2>

            <p>Are you sure you want to save the changes?</p>

            <p className="uk-text-right">
              <button
                className="uk-button uk-button-default uk-modal-close"
                type="button"
                onClick={() => console.log("Test3")}
              >
                Cancel
              </button>

              <button
                className="uk-button uk-button-primary uk-modal-close"
                type="button"
                onClick={() =>
                  this.save(
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
                  )
                }
              >
                Save
              </button>
            </p>
          </div>
        </div>
      </>
    );
  }
}
