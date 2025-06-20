import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneConfiguration } from '@microsoft/sp-webpart-base';
export interface IPraeventionTimeplanerWebPartProps {
    description: string;
}
export default class PraeventionTimeplanerWebPart extends BaseClientSideWebPart<IPraeventionTimeplanerWebPartProps> {
    render(): void;
    protected readonly dataVersion: Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
