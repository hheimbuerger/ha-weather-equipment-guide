import { WeatherEquipmentGuideCard } from "./card";
// import { LeaveAssistantCardEditor } from ""./editor.ts.inactivetor";

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

customElements.define("weather-equipment-guide", WeatherEquipmentGuideCard);
// customElements.define(
//   "leave-assistant-card-editor",
//   LeaveAssistantCardEditor
// );

window.customCards = window.customCards || [];
window.customCards.push({
  type: "weather-equipment-guide",
  name: "Weather Equipment Guide Card",
  description: "Gives clothing and equipment suggestions based on the weather forecast",
});
