import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'PraeventionTimePlannerWebPartStrings';
import PraeventionTimePlanner from './components/PraeventionTimePlanner';
import { IPraeventionTimePlannerProps } from './components/IPraeventionTimePlannerProps';

export interface IPraeventionTimePlannerWebPartProps {
  description: string;
}

export default class PraeventionTimePlannerWebPart extends BaseClientSideWebPart<IPraeventionTimePlannerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IPraeventionTimePlannerProps> = React.createElement(
      PraeventionTimePlanner,
      {
        description: this.properties.description,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
