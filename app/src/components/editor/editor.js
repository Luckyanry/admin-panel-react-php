import React, {Component} from "react";
import axios from "axios";
import UIkit from "uikit";

import "../../helpers/iframeLoader";
import DOMHelper from "../../helpers/dom-helper";

import EditorText from "../editor-text";
import Spinner from "../spinner";
import ComfirmModal from "../confirm-modal";
import ChooseModal from "../choose-modal";
import Panel from "../panel";
import EditorMeta from "../editor-meta";
import EditorImages from "../editor-images";
import Login from "../login";

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      backupsList: [],
      newPageName: "",
      loading: true,
      auth: false,
    };

    this.isLoading = this.isLoading.bind(this);
    this.isLoaded = this.isLoaded.bind(this);
    this.save = this.save.bind(this);
    this.init = this.init.bind(this);
    this.login = this.login.bind(this);
    this.restoreBackup = this.restoreBackup.bind(this);
  }

  componentDidMount() {
    this.checkAuth();
  }

  componentDidUpdate(_, prevState) {
    if (this.state.auth !== prevState.auth) {
      this.init(null, this.currentPage);
    }
  }

  checkAuth() {
    axios.get("./api/checkAuth.php").then((res) => {
      console.log(res.data);
      this.setState({
        auth: res.data.auth,
      });
    });
  }

  login(pass) {
    if (pass.length > 5) {
      axios.post("./api/login.php", {password: pass}).then((res) => {
        this.setState({
          auth: res.data.auth,
        });
      });
    }
  }

  init(e, page) {
    if (e) {
      e.preventDefault();
    }

    if (this.state.auth) {
      this.isLoading();
      this.iframe = document.querySelector("iframe");
      this.open(page, this.isLoaded);
      this.loadPageList();
      this.loadBackupsList();
    }
  }

  open(page, cb) {
    this.currentPage = page;

    axios
      .get(`../${page}?rnd=${Math.random()}`)
      .then((res) => DOMHelper.parseStrToDOM(res.data))
      .then(DOMHelper.wrapTextNodes)
      .then(DOMHelper.wrapImages)
      .then((dom) => {
        this.virtualDom = dom;
        return dom;
      })
      .then(DOMHelper.serializeDOMToString)
      .then((html) => axios.post("./api/saveTempPage.php", {html}))
      .then(() => this.iframe.load("../temp-page-dont-change.html"))
      .then(() => axios.post("./api/deleteTempPage.php"))
      .then(() => this.enableEditing())
      .then(() => this.injectStyles())
      .then(cb);

    this.loadBackupsList();
  }

  async save() {
    this.isLoading();
    const newDom = this.virtualDom.cloneNode(this.virtualDom);

    DOMHelper.unwrapTextNodes(newDom);
    DOMHelper.unwrapImages(newDom);
    const html = DOMHelper.serializeDOMToString(newDom);

    await axios
      .post("./api/savePage.php", {pageName: this.currentPage, html})
      .then(() => this.showNotifications("Successfully saved", "success"))
      .catch(() => this.showNotifications("Changes not saved!", "danger"))
      .finally(this.isLoaded);

    this.loadBackupsList();
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

    this.iframe.contentDocument.body
      .querySelectorAll("[editableimgid]")
      .forEach((elem) => {
        const id = elem.getAttribute("editableimgid");
        const virtualElement = this.virtualDom.body.querySelector(
          `[editableimgid="${id}"]`
        );

        new EditorImages(
          elem,
          virtualElement,
          this.isLoading,
          this.isLoaded,
          this.showNotifications
        );
      });
  }

  injectStyles() {
    const style = this.iframe.contentDocument.createElement("style");
    style.innerHTML = `
      text-editor:hover, 
      [editableimgid]:hover {
        outline: 2px solid orange;
        outline-offset: 8px;
      }

      text-editor:focus {
        outline: 2px solid red;
        outline-offset: 8px;
      }
    `;

    this.iframe.contentDocument.head.appendChild(style);
  }

  loadPageList() {
    axios
      .get("./api/pageList.php")
      .then((res) => this.setState({pageList: res.data}));
  }

  loadBackupsList() {
    axios.get("./backups/backups.json").then((res) =>
      this.setState({
        backupsList: res.data.filter((backup) => {
          return backup.page === this.currentPage;
        }),
      })
    );
  }

  restoreBackup(e, backup) {
    if (e) {
      e.preventDefault();
    }

    UIkit.modal
      .confirm(
        "Are you sure you want to restore the page from this backup? All unsaved data will be lost!",
        {labels: {ok: "Restore", cancel: "Cancel"}}
      )
      .then(() => {
        this.isLoading();
        return axios.post("./api/restoreBackup.php", {
          page: this.currentPage,
          file: backup,
        });
      })
      .then(() => this.open(this.currentPage, this.isLoaded));
  }

  showNotifications(message, status) {
    UIkit.notification({message, status});
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
    const {loading, pageList, backupsList, auth} = this.state;
    const modal = true;
    let spinner;

    loading ? (spinner = <Spinner active />) : <Spinner />;

    if (!auth) {
      return <Login login={this.login} />;
    }

    return (
      <>
        <Login login={this.login} />

        <iframe src="" frameBorder="0"></iframe>

        <input
          id="img-upload"
          type="file"
          accept="image/*"
          style={{display: "none"}}
        />

        {spinner}

        <Panel method={this.save} />

        <ComfirmModal modal={modal} target={"modal-save"} method={this.save} />

        <ChooseModal
          modal={modal}
          target={"modal-open"}
          data={pageList}
          redirect={this.init}
        />

        <ChooseModal
          modal={modal}
          target={"modal-backup"}
          data={backupsList}
          redirect={this.restoreBackup}
        />

        {this.virtualDom ? (
          <EditorMeta
            modal={modal}
            target={"modal-meta"}
            virtualDom={this.virtualDom}
          />
        ) : (
          false
        )}
      </>
    );
  }
}
