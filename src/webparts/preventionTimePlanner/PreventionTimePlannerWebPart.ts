import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'PreventionTimePlannerWebPartStrings';
import PreventionTimePlanner from './components/PreventionTimePlanner';
import { IPreventionTimePlannerProps } from './components/IPreventionTimePlannerProps';

export interface IPreventionTimePlannerWebPartProps {
  description: string;
}

export default class PreventionTimePlannerWebPart extends BaseClientSideWebPart<IPreventionTimePlannerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IPreventionTimePlannerProps> = React.createElement(
      PreventionTimePlanner,
      {
        description: this.properties.description,
        isDarkTheme: false,
        environmentMessage: '',
        hasTeamsContext: false,
        userDisplayName: ''
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
