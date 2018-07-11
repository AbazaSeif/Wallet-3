import * as React from 'react';
import * as cn from 'classnames';
import DateRangeDropdown from 'app/components/common/date-range-dropdown';
import { Input } from 'app/components/common/input';
import Toggler from 'app/components/common/toggler';
import { IChangeParams } from 'app/components/common/types';

interface IDealFilter {
    query: string;
    dateFrom: number;
    dateTo: number;
    onlyActive: boolean;
}

export interface IDealFilterPanelProps extends IDealFilter {
    className?: string;
    onUpdateFilter: (
        key: keyof IDealFilter,
        value: IDealFilter[keyof IDealFilter],
    ) => void;
}

export class DealFilterPanel extends React.Component<
    IDealFilterPanelProps,
    never
> {
    constructor(props: IDealFilterPanelProps) {
        super(props);
    }

    protected handleChangeDateRange = () => {};

    protected handleChangeInput = (params: IChangeParams<boolean | string>) => {
        const key = params.name as keyof IDealFilter;
        const value: IDealFilter[keyof IDealFilter] = params.value;
        this.props.onUpdateFilter(key, value);
    };

    public render() {
        return (
            <div className={cn('deal-filter-panel', this.props.className)}>
                <DateRangeDropdown
                    name="deals-date-range-history"
                    className="sonm-deals-filter__date-range"
                    value={[
                        new Date(this.props.dateFrom),
                        new Date(this.props.dateTo),
                    ]}
                    onChange={this.props.handleChangeTime}
                    disabled
                />
                <Input
                    name="search-by-address"
                    placeholder="Search by address"
                    onChange={this.props.handleChangeQuery}
                    className="sonm-deals-filter__query"
                    value={this.props.query}
                    disabled
                />
                <Toggler
                    name="deals-active"
                    className="sonm-deals-filter__active"
                    title="Only active"
                    value={this.props.onlyActive}
                    onChange={this.props.handleChangeActive}
                    disabled
                />
            </div>
        );
    }
}
