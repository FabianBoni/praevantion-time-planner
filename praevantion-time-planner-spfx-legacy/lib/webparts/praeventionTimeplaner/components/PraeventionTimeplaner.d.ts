/// <reference types="react" />
import * as React from 'react';
import { IPraeventionTimeplanerProps } from './IPraeventionTimeplanerProps';
export default class PraeventionTimeplaner extends React.Component<IPraeventionTimeplanerProps, any> {
    constructor(props: IPraeventionTimeplanerProps);
    private handleDayToggle;
    private handleSearch;
    private getDayDisplayName;
    private getTeamPairStats;
    render(): React.ReactElement<IPraeventionTimeplanerProps>;
}
