import React, {Component} from "react";
import axios from "axios";
import UIkit from "uikit";

import "../../helpers/iframeLoader";
import DOMHelper from "../../helpers/dom-helper";

import EditorText from "../EditorText";
import Spinner from "../Spinner";
import ConfirmModal from "../ConfirmModal";
import ChooseModal from "../ChooseModal";
import Panel from "../Panel";
import EditorMeta from "../EditorMeta";
import EditorImages from "../EditorImages";
import Login from "../Login";

export default class Editor extends Component {
  currentPage = "index.html";

  state = {
    modal: true,
    pageList: [],
    backupsList: [],
    newPageName: "",
    loading: true,
    auth: false,
    loginError: false,
    loginLengthError: false,
  };

  componentDidMount() {
    this.checkAuth();
  }

  componentDidUpdate(_, prevState) {
    if (this.state.auth !== prevState.auth) {
      this.init(null, this.currentPage);
    }
  }

  checkAuth = () => {
    axios.get("./api/checkAuth.php").then((res) => {
      this.setState({
        auth: res.data.auth,
      });
    });
  };

  login = (pass) => {
    if (pass.length > 5) {
      axios.post("./api/login.php", {password: pass}).then((res) => {
        this.setState({
          auth: res.data.auth,
          loginError: !res.data.auth,
          loginLengthError: false,
        });
      });
    } else {
      this.setState({
        loginError: false,
        loginLengthError: true,
      });
    }
  };

  logout = () => {
    axios.get("./api/logout.php").then(() => {
      window.location.replace("/");
    });
  };

  init = (e, page) => {
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
  };

  open = (page, cb) => {
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
  };

  save = async () => {
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
  };

  enableEditing = () => {
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
  };

  injectStyles = () => {
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
  };

  loadPageList = () => {
    axios
      .get("./api/pageList.php")
      .then((res) => this.setState({pageList: res.data}));
  };

  loadBackupsList = () => {
    axios.get("./backups/backups.json").then((res) =>
      this.setState({
        backupsList: res.data.filter((backup) => {
          return backup.page === this.currentPage;
        }),
      })
    );
  };

  restoreBackup = (e, backup) => {
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
  };

  showNotifications = (message, status) => {
    UIkit.notification({message, status});
  };

  isLoading = () => {
    this.setState({loading: true});
  };

  isLoaded = () => {
    this.setState({
      loading: false,
    });
  };

  render() {
    const {
      loading,
      pageList,
      backupsList,
      auth,
      loginError,
      loginLengthError,
      modal,
    } = this.state;

    let spinner;
    loading ? (spinner = <Spinner active />) : <Spinner />;

    if (!auth) {
      return (
        <Login
          login={this.login}
          loginErr={loginError}
          lengthErr={loginLengthError}
        />
      );
    }

    return (
      <>
        <iframe src="" frameBorder="0"></iframe>

        <input
          id="img-upload"
          type="file"
          accept="image/*"
          style={{display: "none"}}
        />

        {spinner}

        <Panel method={this.save} />

        <ConfirmModal
          modal={modal}
          target={"modal-save"}
          method={this.save}
          text={{
            title: "Apply changes",
            desc: "Are you sure you want to save the changes?",
            btn: "Save",
          }}
        />

        <ConfirmModal
          modal={modal}
          target={"modal-logout"}
          method={this.logout}
          text={{
            title: "LogOut",
            desc: "Are you sure you want to logout?",
            btn: "Confirm",
          }}
        />

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
