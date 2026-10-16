import { createTextElement, createElement } from "./mini-react.js";

const textVNode = createTextElement("Hello");

console.log("Result:", textVNode);

console.assert(
  textVNode.type === "TEXT_ELEMENT",
  "Test failed: Incorrect type"
);

console.assert(
  textVNode.props.nodeValue === "Hello",
  "Test failed: Incorrect nodeValue"
);

console.assert(
  Array.isArray(textVNode.props.children) &&
    textVNode.props.children.length === 0,
  "Test failed: Children must be an empty array"
);

const numberVNode = createTextElement(123);

console.assert(
  numberVNode.props.nodeValue === "123",
  "Test failed: Number must be converted to string"
);

console.log("Number test:", numberVNode);





const nestedVNode = createElement(
  "main",
  null,
  ["Hello", ["World"]]
);

console.log("Flatten test:", nestedVNode.props.children);

console.assert(
  nestedVNode.props.children.length === 2,
  "Test failed: Nested children were not flattened"
);





const filteredVNode = createElement(
  "main",
  null,
  "Hello",
  null,
  false,
  undefined,
  true,
  "World"
);

console.log("Filter test:", filteredVNode.props.children);

console.assert(
  filteredVNode.props.children.length === 2,
  "Test failed: Invalid children were not filtered"
);






const normalizedVNode = createElement(
  "main",
  null,
  "Hello",
  123
);

console.log("Normalization test:", normalizedVNode.props.children);

console.assert(
  normalizedVNode.props.children[0].type === "TEXT_ELEMENT",
  "Test failed: String was not normalized"
);

console.assert(
  normalizedVNode.props.children[1].props.nodeValue === "123",
  "Test failed: Number was not normalized"
);






const originalProps = { id: "title", className: "hero" };

const propsVNode = createElement(
  "h1",
  originalProps,
  "Hello"
);

console.assert(
  propsVNode.props.id === "title",
  "Test failed: id was not preserved"
);

console.assert(
  propsVNode.props.className === "hero",
  "Test failed: className was not preserved"
);

console.assert(
  !Object.hasOwn(originalProps, "children"),
  "Test failed: Original props were mutated"
);

console.log("Props test:", propsVNode);






const childVNode = createElement("h1", null, "Hello");

const parentVNode = createElement(
  "main",
  { id: "root-view" },
  childVNode
);

console.log("Nested VNode test:", parentVNode);

console.assert(
  parentVNode.props.children[0] === childVNode,
  "Test failed: Child VNode was not preserved"
);

console.assert(
  parentVNode.props.children[0].type === "h1",
  "Test failed: Incorrect child VNode type"
);

console.assert(
  parentVNode.props.children[0].props.children[0].props.nodeValue === "Hello",
  "Test failed: Nested text content is incorrect"
);







console.assert(
  (() => {
    try {
      createElement(123, null, "Hello");
      return false;
    } catch (error) {
      return error instanceof TypeError;
    }
  })(),
  "Test failed: Invalid type was not rejected"
);

console.log("Type Guard test completed");





console.assert(
  (() => {
    try {
      createElement("h1", 123, "Hello");
      return false;
    } catch (error) {
      return error instanceof TypeError;
    }
  })(),
  "Test failed: Invalid props were not rejected"
);

console.log("Props Type Guard test completed");






console.assert(
  (() => {
    try {
      createElement("main", null, { name: "Hello" });
      return false;
    } catch (error) {
      return error instanceof TypeError;
    }
  })(),
  "Test failed: Invalid child VNode was not rejected"
);

console.log("Child VNode Type Guard test completed");