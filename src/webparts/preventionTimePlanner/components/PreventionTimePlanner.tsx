import * as React from 'react';
import styles from './PreventionTimePlanner.module.scss';
import { IPreventionTimePlannerProps } from './IPreventionTimePlannerProps';
import { TimePlanner } from './TimePlanner';
import { IAppointment } from '../models/IAppointment';

export default class PreventionTimePlanner extends React.Component<IPreventionTimePlannerProps, {}> {
  
  private handleAppointmentCreated = (appointment: IAppointment): void => {
    console.log('Neues Angebot erstellt:', appointment);
    // Hier könnte weitere Logik implementiert werden, z.B. SharePoint Listen-Update
  }

  public render(): React.ReactElement<IPreventionTimePlannerProps> {
    return (
      <div className={ styles.preventionTimePlanner }>
        <TimePlanner onAppointmentCreated={this.handleAppointmentCreated} />
      </div>
    );
  }
}
