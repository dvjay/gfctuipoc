import { Injectable } from '@angular/core'; 
import { Subject } from 'rxjs';

@Injectable() 
export class NotificationBrokerService {
    private notificationMoveOverSource = new Subject<NotificationMessage>(); 
    private notificationMoveOutsource = new Subject<NotificationMessage>();
    
    notificationMoveOver$ = this.notificationMoveOverSource.asObservable(); 
    notificationMoveOut$ = this.notificationMoveOutsource.asObservable();
    notificationMouseover(message: NotificationMessage) {
        this.notificationMoveOverSource.next(message);
    }
    notificationMouseout(message: NotificationMessage) {
        this.notificationMoveOutsource.next(message);
    }
}

export interface NotificationMessage {
    entityId?: string; 
    nodeIds?: string[];
}