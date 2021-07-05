import React, {Component} from "react";
import axios from "axios";

import "../../helpers/iframeLoader.js";
import DOMHelper from "../../helpers/dom-helper.js";

import EditorText from "../editor-text/editor-text.js";

export default class Editor extends Component {
  constructor() {
    super();

    this.currentPage = "index.html";
    this.state = {
      pageList: [],
      newPageName: "",
    };

    this.createNewPage = this.createNewPage.bind(this);
  }

  componentDidMount() {
    this.init(this.currentPage);
  }

  init(page) {
    this.iframe = document.querySelector("iframe");
    this.open(page);
    this.loadPageList();
  }

  open(page) {
    this.currentPage = page;

    axios
      .get(`../${page}?rnd=${Math.random()}`)
      .then((res) => DOMHelper.parseStringToDOM(res.data))
      .then(DOMHelper.wrapTextNodes)
      .then((dom) => {
        this.virtualDom = dom;
        return dom;
      })
      .then(DOMHelper.serializeDOMToString)
      .then((html) => axios.post("./api/saveTempPage.php", {html}))
      .then(() => this.iframe.load("../temp.html"))
      .then(() => this.enableEditing())
      .then(() => this.injectStyles());
  }

  save() {
    const newDom = this.virtualDom.cloneNode(this.virtualDom);

    DOMHelper.unwrapTextNodes(newDom);

    const html = DOMHelper.serializeDOMToString(newDom);

    axios.post("./api/savePage.php", {pageName: this.currentPage, html});
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

  render() {
    // const {pageList} = this.state;
    // const pages = pageList.map((page, idx) => {
    //   return (
    //     <h1 key={idx}>
    //       {page}
    //       <a href="#" onClick={() => this.deletePage(page)}>
    //         (x)
    //       </a>
    //     </h1>
    //   );
    // });

    return (
      <>
        <button onClick={() => this.save()}>Click</button>
        <iframe src={this.currentPage} frameBorder="0"></iframe>
      </>
      // <>
      //   <input
      //     type="text"
      //     onChange={(e) => {
      //       this.setState({newPageName: e.target.value});
      //     }}
      //   />
      //   <button onClick={this.createNewPage}>Create New Page</button>
      //   {pages}
      // </>
    );
  }
}
