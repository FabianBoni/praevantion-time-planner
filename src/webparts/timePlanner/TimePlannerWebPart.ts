import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'TimePlannerWebPartStrings';
import TimePlanner from './components/TimePlanner';
import { ITimePlannerProps } from './components/ITimePlannerProps';

export interface ITimePlannerWebPartProps {
  description: string;
  appointments: string;
}

export default class TimePlannerWebPart extends BaseClientSideWebPart<ITimePlannerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ITimePlannerProps> = React.createElement(
      TimePlanner,
      {
        description: this.properties.description,
        appointments: this.properties.appointments || '[]',
        onAppointmentsChange: (appointments: string) => {
          this.properties.appointments = appointments;
          this.context.propertyPane.refresh();
        }
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
