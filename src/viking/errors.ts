export class ArgumentError extends Error {

    constructor(message?) {
        super(message);
        this.name = 'Viking.ArgumentError';
        this.message = message;
    }

}

export class NameError extends Error {

    constructor(message?) {
        super(message);
        this.name = 'Viking.NameError';
        this.message = message;
    }

}

export class VikingError extends Error {
    constructor(message?) {
        super(message);
        this.name = 'VikingError';
    }
}

export class ServerError extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'ServerError';
    }
}

export class UnexpectedResponse extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'UnexpectedResponse';
    }
}

export class BadRequest extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'BadRequest';
    }
}

export class Unauthorized extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'Unauthorized';
    }
}

export class Forbidden extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'Forbidden';
    }
}

export class NotFound extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'NotFound';
    }
}

export class Gone extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'Gone';
    }
}

export class MovedPermanently extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'MovedPermanently';
    }
}

export class ApiVersionUnsupported extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'ApiVersionUnsupported';
    }
}

export class ServiceUnavailable extends VikingError {
    constructor(message?) {
        super(message);
        this.name = 'ServiceUnavailable';
    }
}