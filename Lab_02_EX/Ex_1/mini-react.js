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