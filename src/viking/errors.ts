export function urlError() {
    throw new Error('A "url" property or function must be specified');
};

export class ArgumentError extends Error {

    constructor(message) {
        super(message);
        this.name = 'Viking.ArgumentError';
        this.message = message;
    }

}

export class NameError extends Error {

    constructor(message) {
        super(message);
        this.name = 'Viking.NameError';
        this.message = message;
    }

}
