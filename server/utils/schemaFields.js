// Shared mongoose schema field helpers so portfolio documents validate the
// same way for admin writes and public reads.
const HTTP_URL_PATTERN = /^https?:\/\/\S+$/i;

export function isHttpUrl(value) {
    return typeof value === "string" && HTTP_URL_PATTERN.test(value);
}

// Optional http(s) URL string. An empty string is treated as "not provided"
// so admins can clear a field by saving it empty.
export function httpUrlField(maxlength = 500) {
    return {
        type: String,
        trim: true,
        maxlength,
        validate: {
            validator: (value) => value === "" || isHttpUrl(value),
            message: (props) => `${props.path} must be a valid http(s) URL.`,
        },
    };
}

// List of short strings (technologies, services). Controllers normalize the
// incoming values; the model enforces item length and list size as a backstop.
export function stringListField(itemMaxlength, maxItems) {
    return {
        type: [String],
        trim: true,
        maxlength: itemMaxlength,
        validate: {
            validator: (items) =>
                !Array.isArray(items) || items.length <= maxItems,
            message: (props) => `${props.path} accepts at most ${maxItems} items.`,
        },
    };
}
