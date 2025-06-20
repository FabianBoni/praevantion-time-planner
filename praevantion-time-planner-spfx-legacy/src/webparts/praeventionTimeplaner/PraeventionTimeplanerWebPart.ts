import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'PraeventionTimeplanerWebPartStrings';
import PraeventionTimeplaner from './components/PraeventionTimeplaner';
import { IPraeventionTimeplanerProps } from './components/IPraeventionTimeplanerProps';

export interface IPraeventionTimeplanerWebPartProps {
  description: string;
}

export default class PraeventionTimeplanerWebPart extends BaseClientSideWebPart<IPraeventionTimeplanerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IPraeventionTimeplanerProps > = React.createElement(
      PraeventionTimeplaner,
      {
        description: this.properties.description
      }
    );

    ReactDom.render(element, this.domElement);
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
