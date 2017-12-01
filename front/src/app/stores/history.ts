import { observable, computed, IObservableArray, toJS } from 'mobx';
import { asyncAction } from 'mobx-utils';
import * as api from 'app/api';

const Api = api.Api;

export interface ISendForm {
    from: string;
    to: string;
    amount: string;
    gasPrice: string;
    gasLimit: string;
    currency: string;
}

export class HistoryStore {
    @observable public errors: any[] = [];

    @observable.ref public currentPageTxHashList: string[] = [];

    @observable public txMap = new Map<string, api.ISendTransactionResult>();

    @observable protected inProgress: IObservableArray<api.ISendTransactionResult> = observable.array();

    @computed public get currentList(): api.ISendTransactionResult[] {
        const result: api.ISendTransactionResult[] = this.currentPageTxHashList.map(
            hash => toJS(this.txMap.get(hash)) as api.ISendTransactionResult,
        );

        return result;
    }

    @asyncAction
    public *submitTransaction(params: api.ISendTransaction, password: string) {
        try {
            const created = { ...params, confirmCount: 0, status: 'created', hash: '' };
            this.inProgress.push(created);

            const result = yield Api.send(params, password);

            this.inProgress.remove(created);

            this.addTxToMap([result]);

        } catch (e) {
            this.errors.push(e);
        }
    }

    @asyncAction
    public *init() {
        try {
            const { data: [txList, total] } = yield Api.getSendTransactionList();

            console.log(total);

            this.addTxToMap(txList);
            this.currentPageTxHashList = txList.map((x: api.ISendTransactionResult) => x.hash);
        } catch (e) {
            this.errors.push(e);
        }
    }

    protected addTxToMap(txList: api.ISendTransactionResult[]) {
        txList.map((tx: api.ISendTransactionResult) => this.txMap.set(tx.hash, tx));
    }
}

export default HistoryStore;
