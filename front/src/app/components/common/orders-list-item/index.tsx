import * as React from 'react';
import { IOrdersListItemProps } from './types';
import { Balance } from '../balance-view';
import * as cn from 'classnames';
import { ProfileBrief } from 'app/components/common/profile-brief';
import { IPropertyListCssClasses } from 'app/components/common/property-list';
import formatSeconds from 'app/utils/format-seconds';
import Benchmark from '../benchmark';

export class OrdersListItem extends React.Component<IOrdersListItemProps, any> {
    protected handleClick = (event: any) => {
        event.preventDefault();

        this.props.onClick(this.props.order);
    };

    protected static benchmarksCssClasses: Partial<IPropertyListCssClasses> = {
        root: 'orders-list-item__benchmarks',
        label: 'orders-list-item__benchmark-label',
        value: 'orders-list-item__benchmark-value',
    };

    public render() {
        return (
            <a
                {...{ 'data-display-id': `orders-list-item` }}
                className={cn('orders-list-item', this.props.className)}
                href={`#order-i-${this.props.order.id}`}
                onClick={this.handleClick}
            >
                {/* Column 1 - Main Info */}
                <ProfileBrief
                    className="orders-list-item__account"
                    profile={this.props.order.creator}
                    showBalances={false}
                    logoSizePx={50}
                />

                {/* Column 2 - Costs */}
                <div className="orders-list-item__cost">
                    <Balance
                        className="orders-list-item__price"
                        balance={this.props.order.price}
                        decimalPointOffset={18}
                        decimalDigitAmount={4}
                        symbol="USD/h"
                        round
                    />
                    {this.props.order.duration ? (
                        <div
                            data-display-id="orders-list-item-duration"
                            className="orders-list-item__duration"
                        >
                            {formatSeconds(this.props.order.duration)}
                        </div>
                    ) : null}
                </div>

                {/* Optional Column 3 - Children */}
                {this.props.children !== undefined ? (
                    <div className="orders-list-item__child">
                        {this.props.children}
                    </div>
                ) : null}

                {/* Benchmarks */}
                <Benchmark
                    cssClasses={OrdersListItem.benchmarksCssClasses}
                    data={this.props.order.benchmarkMap}
                    ids={Benchmark.gridItemIds}
                    names={Benchmark.gridItemNames}
                />
            </a>
        );
    }
}

export default OrdersListItem;
export * from './types';
