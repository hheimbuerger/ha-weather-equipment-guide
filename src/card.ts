import { html, LitElement, TemplateResult, nothing } from "lit";
import { styles } from "./card.styles";
import { state } from "lit/decorators/state";
import { giveRecommendations, parseRuleDescriptor } from "./ruleset";

import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers";

import {
    type ForecastEvent,
} from './forecast';
import { Rule } from "./types";

interface Config extends LovelaceCardConfig {
  header: string;
  entity: string;
}

export class WeatherEquipmentGuideCard extends LitElement {
  // internal reactive states
  @state() private _header: string | typeof nothing;
  @state() private _entity: string;
  @state() private _name: string;
  @state() private _state: HassEntity;
  @state() private _status: string;

  @state() private forecast?: Forecast;
  @state() private subscribedToForecast?: Promise<() => void>;

  // private property
  private _hass;
  private _hoursLookahead: number = 0;
  private _iconHeight: number = 100;
  private _popDuration: string = '2s';
  private _popDelay: string = '0.5s';
  private _rules: Rule[] = [];

  setConfigRules(config: Config) {
    const rules = Object.entries(config).map(([image, descriptor], _index) => parseRuleDescriptor(`${image}: ${descriptor}`));   // FIXME: this string-reconcatenation is a disgusting approach at code reuse, just so I don't have to modify the function right now...
    return rules;
  }

  // lifecycle interface
  setConfig(config: Config) {
    // console.log('setConfig()', config);

    this._header = config.header === "" ? nothing : config.header;
    this._entity = config.entity;
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
    this._hoursLookahead = Number(config.hours) > 0 ? Number(config.hours) : 2;
    this._iconHeight = Number(config.iconHeight) > 0 ? Number(config.iconHeight) : 100;
    this._popDuration = config.popDuration ?? this._popDuration;
    this._popDelay = config.popDelay ?? this._popDelay;
    this._rules = this.setConfigRules(config.rules);
  }

  set hass(hass: HomeAssistant) {
    // TODO: no idea what this does -- check if I need any of this code from the sample
    this._hass = hass;
    this._state = hass.states[this._entity];
    if (this._state) {
      this._status = this._state.state;
      let fn = this._state.attributes.friendly_name;
      this._name = fn ? fn : this._entity;
    }
  }

  // declarative part
  static styles = styles;

  render() {
    let content: TemplateResult;
    if (!this._state || !this.forecast) {
      content = html` <p class="error">${this._entity} is unavailable.</p> `;
    } else {
        var forecast = (this.forecast && this.forecast.length >= 5)
            ? this.forecast.slice(0, 5).map(fc => html`<li>${fc.temperature}C with a ${fc.precipitation_probability}% chance of rain</li>`)
            : html`<span>Error: no forecast available</span>`;

        // <!-- <ul>
        // ${forecast}
        // </ul> -->

      const recommendations = giveRecommendations(this._rules, this.forecast.slice(0, this._hoursLookahead+1));

      const iconHeight = this._iconHeight;
      function* recommendationsGenerator() {
        var counter = 0;
        for (const recommendation of recommendations) {
            yield html`
                <div class="fade-in" style="--pop-index: ${counter}">
                    <img src="/local/weather-equipment-guide-card/${recommendation}.png" height="${iconHeight}" >
                </div>
            `;
            counter++;
        }
      };

      content = html`
        <div class="recommendations-container">
          ${recommendationsGenerator()}
        </div>
      `;
    }

    return html`
      <ha-card header="${this._header}" style="--pop-delay: ${this._popDelay}; --pop-duration: ${this._popDuration}">
        ${content}
      </ha-card>
    `;
  }

  // event handling
  doToggle() {
    this._hass.callService("light", "toggle", {
      entity_id: this._entity,
    });
  }

  // card configuration
  static getConfigElement() {
    //return document.createElement("toggle-card-typescript-editor");
    var elem = document.createElement("card-editor");
    elem.innerHTML = '<p>Card editor UI is not yet implemented, please click on Show Code Editor and refer to <a href="https://github.com/hheimbuerger/ha-weather-equipment-guide#Options">the README</a></p>';
    return elem;
  }

  static getStubConfig() {
    return {
      entity: "weather.openweathermap",
      hours: 4,
      rules: {
        umbrella: '%>10',
        coat: 'C<18',
        gloves: 'C<5',
        sunglasses: 'C>25',
      },
    };
  }

  private async subscribeToForecastEvents() {
    this.unsubscribeForecastEvents();

    if (!this._hass) throw new Error('attempted subscription without HASS being initialized')
    if (!this._entity) throw new Error('attempted subscription without entity being specified')
    if (!this._entity.startsWith('weather.')) throw new Error('entity is expected to be a weather.* entity')
    if (!this.hassSupportsForecastEvents()) throw new Error('forecasts not supported')

    this.subscribedToForecast = this._hass.connection.subscribeMessage(
        (evt) => this.onForecastReceived(evt),
      {
        type: 'weather/subscribe_forecast',
        forecast_type: 'hourly',
        entity_id: this._entity
      });
  }

  private unsubscribeForecastEvents() {
    if (this.subscribedToForecast) {
      this.subscribedToForecast.then((unsub) => {
        console.log('unsubscribed');
        unsub()
      });
      this.subscribedToForecast = undefined;
    }
  }

  private onForecastReceived(forecastEvent: ForecastEvent) {
    console.log('received forecast:', forecastEvent.forecast);

    // we only want to do this once, this card chooses not to update!
    this.unsubscribeForecastEvents();

    this.forecast = forecastEvent.forecast;
    // this.forecast = [
    //     declareForecast({
    //         condition: 'sunny',
    //         temperature: 25,
    //     })
    // ];
  }

  private hassSupportsForecastEvents(): boolean {
    return !!(this._hass?.services?.weather?.get_forecasts) || !!(this._hass?.services?.weather?.get_forecast);
  }

  connectedCallback() {
    super.connectedCallback();

    console.log('Card connected, now subscribing to forecast events...');
    this.subscribeToForecastEvents();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeForecastEvents();
  }

}
