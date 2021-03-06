import * as t from './types';

export * from './types';

export interface InterfaceIPC {
    send<TParams, TResult>(
        method: string,
        payload: TParams,
    ): t.TResultPromise<TResult>;
    setRequestProcessor(processRequest: t.TRequestProcessor<any, any>): void;
}

export interface IIpcCtrArguments {
    worker?: t.IWorker | t.IWindowWorker;
    errorMessageMap?: t.IValidation;
}

const noop = (x: any) => undefined;

export class IPC implements InterfaceIPC {
    private worker: t.IWorker | t.IWindowWorker;
    private requestIdToListener: Map<string, t.TListener<any>>;
    private requestIdCount = 0;
    private processRequest?: t.TRequestProcessor<any, any>;
    private sign = IPC.generateSign();
    private errorMessageMap: t.IValidation;

    constructor(params: IIpcCtrArguments = {}) {
        const { worker = self, errorMessageMap = {} } = params;

        if (!worker.postMessage) {
            throw new Error('worker is not IWorker implementation');
        }

        this.worker = worker;
        this.worker.addEventListener('message', this.onMessage);
        this.errorMessageMap = errorMessageMap;
        this.requestIdToListener = new Map<string, t.TListener<any>>();
    }

    private static generateSign(): string {
        return (
            `${Date.now().toString(36)}-` +
            `${Math.random()
                .toString(36)
                .slice(2)}-${Math.random()
                .toString(36)
                .slice(2)}`
        );
    }

    private getListenerByRequestId(requestId: string): t.TListener<any> {
        return this.requestIdToListener.get(requestId) || noop;
    }

    private onMessage: t.TMessageHandler = async (event: MessageEvent) => {
        const processRequest = this.processRequest;

        if (event.data.sign === this.sign && event.data.requestId) {
            const message = event.data;
            const requestId = message.requestId;

            this.getListenerByRequestId(requestId)(message);
        } else if (
            processRequest !== undefined &&
            event.data &&
            event.data.method &&
            event.data.sign &&
            event.data.requestId
        ) {
            const sign = event.data.sign as string;
            const requestId = event.data.requestId as string;

            const sendResponse = async (
                result?: t.IResult<any>,
                err?: Error,
            ) => {
                const success = err === undefined;

                const response: t.IResponse<any> = {
                    done: true, // see continuation
                    data: undefined,
                    error: undefined,
                    requestId,
                    sign,
                    success,
                };

                if (typeof result === 'object') {
                    const { data, validation } = result;

                    response.data = data;

                    (response as t.IFormResponse<any>).validation = validation;
                } else {
                    response.data = result;
                }

                if (err !== undefined) {
                    response.error =
                        'message' in err ? err.message : String(err);
                }

                this.postMessage(response);
            };

            processRequest(event.data.method, event.data.payload)
                .then(r => sendResponse(r, undefined))
                .catch(e => sendResponse(undefined, e));
        }
    };

    private getNextRequestId(): string {
        return 'request' + this.requestIdCount++;
    }

    private processValidation(input: t.IValidation): t.IValidation {
        return Object.keys(input).reduce((acc: t.IValidation, key: string) => {
            const phrase = input[key];

            acc[key] =
                phrase in this.errorMessageMap
                    ? this.errorMessageMap[phrase]
                    : phrase;

            return acc;
        }, {});
    }

    public send<TParams, TResult>(
        method: string,
        payload: TParams,
    ): t.TResultPromise<any> {
        return new Promise((done, reject) => {
            const requestId = this.getNextRequestId();

            const callback: t.TListener<TResult> = (
                response: t.IResponse<TResult>,
            ) => {
                const formResponse = response as t.IFormResponse<TResult>;

                if (formResponse.validation !== undefined) {
                    formResponse.validation = this.processValidation(
                        formResponse.validation,
                    );
                }

                if (response.done) {
                    this.requestIdToListener.delete(requestId);
                }

                if (response.success) {
                    done({
                        data: response.data,
                        validation: response.validation,
                    });
                } else {
                    /* tslint:disable */
                    console.error(`method ${method} error: ${response.error}`);
                    console.error(payload);
                    console.error(response);
                    /* tslint:enable */

                    reject(response.error || 'request failed');
                }
            };

            this.requestIdToListener.set(requestId, callback as any);

            const request: t.IRequest<TParams> = {
                requestId,
                method,
                payload,
                sign: this.sign,
            };

            this.postMessage(request);
        });
    }

    private postMessage(request: any) {
        (this.worker as any).postMessage(request);
    }

    public setRequestProcessor(
        processRequest: t.TRequestProcessor<any, any>,
    ): void {
        if (typeof processRequest === 'function') {
            this.processRequest = processRequest;
        }
    }
}

export default IPC;
