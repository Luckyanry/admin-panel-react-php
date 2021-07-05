import React, {Component} from "react";
import axios from "axios";

export default class Editor extends Component {
  constructor() {
    super();

    this.state = {
      pageList: [],
      newPageName: "",
    };

    this.createNewPage = this.createNewPage.bind(this);
  }

  componentDidMount() {
    this.loadPageList();
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

  render() {
    const {pageList} = this.state;
    const pages = pageList.map((page, idx) => {
      return <h1 key={idx}>{page}</h1>;
    });

    return (
      <>
        <input
          type="text"
          onChange={(e) => {
            this.setState({newPageName: e.target.value});
          }}
        />
        <button onClick={this.createNewPage}>Create New Page</button>
        {pages}
      </>
    );
  }
}
