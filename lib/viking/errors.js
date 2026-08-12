// `name` is derived from the runtime class name, so subclasses don't set it
// themselves. Apps that minify their bundles and rely on `error.name` in
// logs or error reporting should preserve class names (e.g. esbuild
// `keepNames`, terser `keep_classnames`).
export class VikingError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ArgumentError extends VikingError {}

export class NameError extends VikingError {}

export class ServerError extends VikingError {}

export class UnexpectedResponse extends VikingError {}

export class BadRequest extends VikingError {
    constructor(message, response = {}) {
        super(message);
        this.response = response;
    }
}

export class Unauthorized extends VikingError {}

export class Forbidden extends VikingError {}

export class NotFound extends VikingError {}

export class Gone extends VikingError {}

export class MovedPermanently extends VikingError {}

export class UnprocessableEntity extends VikingError {
    constructor(message = 'Unprocessable Entity') {
        super(message);
    }
}

export class ApiVersionUnsupported extends VikingError {}

export class ServiceUnavailable extends VikingError {}

export class NetworkError extends VikingError {
    constructor(message = 'A network error occurred') {
        super(message);
    }
}

export class TimeoutError extends VikingError {
    constructor(message = 'The request timed out') {
        super(message);
    }
}

export class AbortError extends VikingError {
    constructor(message = 'The request was aborted') {
        super(message);
    }
}

export class ConnectionNotEstablished extends VikingError {}

export class ActionNotFound extends VikingError {}

export class RecordError extends VikingError {}

export class RecordNotSaved extends RecordError {}

export class DoubleRenderError extends VikingError {}

export class ClassNotFound extends VikingError {}

export class NotImplementedError extends VikingError {}

export class ConnectionMismatch extends VikingError {}
