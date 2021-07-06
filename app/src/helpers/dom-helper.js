export default class DOMHelper {
  static parseStrToDOM(str) {
    const parser = new DOMParser();
    return parser.parseFromString(str, "text/html");
  }

  static wrapTextNodes(dom) {
    const body = dom.body;
    let textNodes = [];

    function recursy(elem) {
      elem.childNodes.forEach((node) => {
        if (
          node.nodeName === "#text" &&
          node.nodeValue.replace(/\s+/g, "").length > 0
        ) {
          textNodes.push(node);
        } else {
          recursy(node);
        }
      });
    }
    recursy(body);

    textNodes.forEach((node, idx) => {
      const wrapper = dom.createElement("text-editor");

      node.parentNode.replaceChild(wrapper, node);

      wrapper.appendChild(node);
      wrapper.setAttribute("nodeid", idx);
    });

    return dom;
  }

  static serializeDOMToString(dom) {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(dom);
  }

  static unwrapTextNodes(dom) {
    dom.body
      .querySelectorAll("text-editor")
      .forEach((elem) => elem.parentNode.replaceChild(elem.firstChild, elem));
  }
}
