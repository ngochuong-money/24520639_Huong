export function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(text),
      children: []
    }
  };
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" && child !== null
          ? child
          : createTextElement(child)
      )
    }
  };
}


export function renderToDOM(vnode) {
  if (vnode.type === "TEXT_ELEMENT") {
    return document.createTextNode(vnode.props.nodeValue);
  }

  const element = document.createElement(vnode.type);

  for (const [key, value] of Object.entries(vnode.props)) {
    if (key === "children") {
      continue;
    }

    if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(
        key.slice(2).toLowerCase(),
        value
      );
    } else if (key === "className") {
      element.setAttribute("class", value);
    } else if (value !== null && value !== undefined) {
      element.setAttribute(key, value);
    }
  }

  for (const child of vnode.props.children) {
    element.appendChild(renderToDOM(child));
  }

  return element;
}
