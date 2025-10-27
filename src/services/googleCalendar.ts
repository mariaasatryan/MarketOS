import { GoogleAuthService } from './googleAuth';
import type { CalendarEvent } from '../types';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
  extendedProperties?: {
    private?: {
      marketplace?: string;
      eventType?: string;
      vmEventId?: string;
    };
  };
}

export class GoogleCalendarService {
  private static async getHeaders(): Promise<HeadersInit> {
    const tokens = await GoogleAuthService.getTokens();
    if (!tokens) {
      throw new Error('Google authentication required');
    }

    return {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  static async listCalendars(): Promise<any[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${GOOGLE_CALENDAR_API}/users/me/calendarList`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendars');
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error listing calendars:', error);
      throw error;
    }
  }

  static async createEvent(
    event: CalendarEvent,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    try {
      const headers = await this.getHeaders();

      const googleEvent = this.convertToGoogleEvent(event);

      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(googleEvent),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async updateEvent(
    eventId: string,
    event: CalendarEvent,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    try {
      const headers = await this.getHeaders();

      const googleEvent = this.convertToGoogleEvent(event);

      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(googleEvent),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok && response.status !== 410) {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  static async getEvents(
    timeMin: Date,
    timeMax: Date,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent[]> {
    try {
      const headers = await this.getHeaders();

      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?${params}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  static async syncEvents(
    localEvents: CalendarEvent[],
    calendarId: string = 'primary'
  ): Promise<{ created: number; updated: number; deleted: number }> {
    try {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneYearAhead = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      const googleEvents = await this.getEvents(oneYearAgo, oneYearAhead, calendarId);

      const vmEvents = googleEvents.filter(
        event => event.extendedProperties?.private?.vmEventId
      );


      const localEventIds = new Set(localEvents.map(event => event.id));

      let created = 0;
      let updated = 0;
      let deleted = 0;

      for (const localEvent of localEvents) {
        const existingGoogleEvent = vmEvents.find(
          ge => ge.extendedProperties?.private?.vmEventId === localEvent.id
        );

        if (existingGoogleEvent) {
          await this.updateEvent(existingGoogleEvent.id, localEvent, calendarId);
          updated++;
        } else {
          await this.createEvent(localEvent, calendarId);
          created++;
        }
      }

      for (const vmEvent of vmEvents) {
        const vmEventId = vmEvent.extendedProperties?.private?.vmEventId;
        if (vmEventId && !localEventIds.has(vmEventId)) {
          await this.deleteEvent(vmEvent.id, calendarId);
          deleted++;
        }
      }

      return { created, updated, deleted };
    } catch (error) {
      console.error('Error syncing events:', error);
      throw error;
    }
  }

  static async createMeetingEvent(
    event: CalendarEvent,
    meetingType: 'google_meet' | 'zoom' = 'google_meet',
    zoomLink?: string,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    try {
      const headers = await this.getHeaders();

      const googleEvent = this.convertToGoogleEvent(event);

      if (meetingType === 'google_meet') {
        googleEvent.conferenceData = {
          createRequest: {
            requestId: `vm-${event.id}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      } else if (meetingType === 'zoom' && zoomLink) {
        if (!googleEvent.description) {
          googleEvent.description = '';
        }
        googleEvent.description += `\n\nZoom: ${zoomLink}`;
      }

      const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(googleEvent),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create meeting event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating meeting event:', error);
      throw error;
    }
  }

  private static convertToGoogleEvent(event: CalendarEvent): any {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1);

    return {
      summary: event.title,
      description: this.buildDescription(event),
      start: {
        date: event.date,
        timeZone: 'Europe/Moscow',
      },
      end: {
        date: event.date,
        timeZone: 'Europe/Moscow',
      },
      extendedProperties: {
        private: {
          marketplace: event.marketplace || '',
          eventType: event.type,
          vmEventId: event.id,
        },
      },
    };
  }

  private static buildDescription(event: CalendarEvent): string {
    let description = '';

    if (event.marketplace) {
      const marketplaceMap: Record<string, string> = {
        wildberries: 'Wildberries',
        ozon: 'Ozon',
        ym: 'Яндекс Маркет',
      };
      const marketplaceName = marketplaceMap[event.marketplace] || event.marketplace;

      description += `Маркетплейс: ${marketplaceName}\n`;
    }

    if (event.warehouse) {
      description += `Склад: ${event.warehouse}\n`;
    }

    if (event.assignee) {
      description += `Ответственный: ${event.assignee}\n`;
    }

    description += `\nТип события: ${event.type}`;

    if (event.relatedTo) {
      description += `\nСвязано с: ${event.relatedTo}`;
    }

    return description;
  }
}
