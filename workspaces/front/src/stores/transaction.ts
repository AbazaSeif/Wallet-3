import { observable, action, computed } from 'mobx';
import { asyncAction } from 'mobx-utils';
import * as api from 'api';

export interface ITransaction {

}

export class TransactionStore {
  @observable
  public gasLimit = '';

  @observable
  public gasPrice = '';

  @observable
  public isLoading = false;

  @observable
  public error = '';

  @observable
  public transactions: ITransaction[] = [];

  @asyncAction
  public *processTransaction(
    from: string,
    to: string,
    qty: string,
    currency: api.TCurrency,
    gasPrice?: string,
    gasLimit?: string,
  ) {
    this.isLoading = true;

    try {
      const response = yield api.methods.processTransaction(
        from, to, qty, currency, gasPrice, gasLimit,
      );

    } catch (e) {
      this.error = String(e);
    } finally {
      this.isLoading = false;
    }
  }
}
