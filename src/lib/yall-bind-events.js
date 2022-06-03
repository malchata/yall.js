export function yallBindEvents (element, events) {
  for (const eventIndex in events) {
    const eventObject = events[eventIndex];

    element.addEventListener(eventIndex, eventObject.listener || eventObject, eventObject.options || undefined);
  }
}
