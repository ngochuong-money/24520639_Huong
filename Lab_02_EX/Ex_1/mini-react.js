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
    if (typeof type !== "string" || type.trim() === "") {
        throw new TypeError("VNode type must be a non-empty string");
    }
    if (
        props !== null &&
        props !== undefined &&
        (typeof props !== "object" || Array.isArray(props))
    ) {
        throw new TypeError("VNode props must be an object");
    }
    const normalizedChildren = children
        .flat(Infinity)
        .filter(child =>
            child !== null &&
            child !== undefined &&
            typeof child !== "boolean"
        )
        .map(child => {
            if (typeof child === "string" || typeof child === "number") {
                return createTextElement(child);
            }

            if (
                typeof child !== "object" ||
                Array.isArray(child) ||
                typeof child.type !== "string" ||
                child.type.trim() === "" ||
                child.props === null ||
                typeof child.props !== "object" ||
                Array.isArray(child.props) ||
                !Array.isArray(child.props.children)
            ) {
                throw new TypeError("Invalid child VNode");
            }

            return child;
        });

    return {
        type: type,
        props: {
            ...props,
            children: normalizedChildren
        }
    };
}

export function renderToDOM(vNode) {
    if (
        vNode === null ||
        typeof vNode !== "object" ||
        Array.isArray(vNode) ||
        typeof vNode.type !== "string" ||
        vNode.type.trim() === "" ||
        vNode.props === null ||
        typeof vNode.props !== "object" ||
        Array.isArray(vNode.props) ||
        !Array.isArray(vNode.props.children)
    ) {
        throw new TypeError("Invalid VNode");
    }
    if (vNode.type === "TEXT_ELEMENT") {
        if (
            typeof vNode.props.nodeValue !== "string" ||
            vNode.props.children.length !== 0
        ) {
            throw new TypeError("Invalid TEXT_ELEMENT VNode");
        }
        return document.createTextNode(vNode.props.nodeValue);
    }

    const dom = document.createElement(vNode.type);

    Object.entries(vNode.props).forEach(([name, value]) => {
        if (name === "children") {
            return;
        }

        if (name === "onClick") {
            if (typeof value !== "function") {
                throw new TypeError("onClick must be a function");
            }

            dom.addEventListener("click", value);
            return;
        }

        if (name === "style") {
            if (
                value !== null &&
                typeof value === "object" &&
                !Array.isArray(value)
            ) {
                Object.entries(value).forEach(([property, cssValue]) => {
                    if (typeof cssValue === "string" || typeof cssValue === "number") {
                        dom.style[property] = cssValue;
                    }
                });
            }

            return;
        }

        const allowedAttributes = [
            "id",
            "role",
            "title",
            "aria-label",
            "aria-hidden",
            "tabindex"
        ];

        if (allowedAttributes.includes(name)) {
            if (typeof value === "string" || typeof value === "number") {
                dom.setAttribute(name, String(value));
            }
        }
    });
    vNode.props.children.forEach(child => {
        const childDOM = renderToDOM(child);
        dom.appendChild(childDOM);
    });

    return dom;
}