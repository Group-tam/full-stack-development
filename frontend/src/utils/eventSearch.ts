import { Event } from '../dataTypes/type';

interface EventSearchOptions {
    eventName?: string;
    filterType?: 'all' | 'joined' | 'owned';
}

export function searchEvents(events: Event[], options: EventSearchOptions): Event[] {
    if (!options.eventName) {
        return events;
    }

    return events.filter(event => {
        // Filter by event name (start substring match)
        if (options.eventName && !event.eventName.toLowerCase().startsWith(options.eventName.toLowerCase())) {
            return false;
        }

        // Filter by joined/owned if specified
        if (options.filterType === 'joined') {
            // Handled at component level since it needs user context
            return true;
        }
        if (options.filterType === 'owned') {
            // Handled at component level since it needs user context
            return true;
        }

        return true;
    });
}