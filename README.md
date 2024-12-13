# Weather Equipment Guide Card

Home Assistant dashboard card, providing personal equipment recommendations based on the weather forecast.

![Screenshot](pub/preview_with_Kiranshastry_icons.gif)

(Icons in the demo by [Kiranshastry](https://www.flaticon.com/search?author_id=257&style_id=879), license required, and not included)

## State

Alpha, if that. Proof-of-concept really.

Expect nothing to be stable!

## Installation

### Install via HACS

**1.** Open HACS from your Home Assistant sidebar

**2.** Add [this repository](https://github.com/hheimbuerger/lovelace-weather-equipment-guide-card) as a custom repository (Three dots in top right corner -> Custom repositories)

**3.** Select "Lovelace" as the category

**4.** In HACS, search for `Weather Equipment Guide`, select, click on the `Download` button in the bottom right, and confirm to `Download`

**5.** Confirm to reload your browser

**6.** Create the folder `weather-equipment-guide-card` in the `www` subdirectory next to your configuration.yaml and [drop your equipment PNGs there](#pre-requisites)

**7.** You can now add this card to your dashboard

## Pre-requisites

Currently, this card does not come with its own equipment icons, nor can you currently use MDI icons.

So you need to grab your own and drop them into your HA folder `www/weather-equipment-guide-card/`

For example, the full path might be:

```
/var/opt/homeassistant/www/weather-equipment-guide-card/umbrella.png
```

## Options

There is currently no card editor UI, the card must be configured via YAML.

| Name                             | Type                   | Requirement  | Description                                                                                                                                                     | Default             |
|----------------------------------|------------------------|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `type`                           | string                 | **Required** | `custom:weather-equipment-guide`                                                                                                                                |                     |
| `entity`                         | string                 | **Required** | Home Assistant weather entity ID. Needs to provide hourly forecast. Only tested with OpenWeatherMap.                                                            |                     |
| `header`                         | string                 | **Optional** | HA card-internal headline                                                                                                                                       | (none)              |
| `hours`                          | number                 | **Optional** | Number of hours to look ahead in the forecast and apply the rules to.                                                                                           | `2`                 |
| `iconHeight`                     | number                 | **Optional** | Vertical size (in pixels) the displayed images are scaled to                                                                                                                | `100`               |
| `popDuration`                    | string (CSS time)      | **Optional** | How long each icon is supposed to fade in for. Must be a [CSS &lt;time&gt; data type](https://developer.mozilla.org/en-US/docs/Web/CSS/time). Set to `0s` to hide animation. | `2s`                |
| `popDelay`                    | string (CSS time)      | **Optional** | How long each subsequent icon is delayed from animating in, to give the impression of them showing up sequentially. Must be a [CSS &lt;time&gt; data type](https://developer.mozilla.org/en-US/docs/Web/CSS/time). Set to `0s` to have all appear at the same time. | `0.5s`                |
| `rules`                          | [Rules](#rules-options)        | **Required** | The rules to apply                                                                                                                                              |                     |


## Rules Options

This is a set of YAML [key/value pairs](https://en.wikipedia.org/wiki/YAML#Basic_components). The key is the image basename (without path or extension), the value is a rule descriptor.

The rule descriptor consists of a field (currently `C` for temperature forecast or `%` for precipitation chance), followed by an operator (currently `<` or `>`), followed by a numerical value (percentage or absolute temperature, depending on the field).

See the following section for examples.

## Example configuration

```yaml
type: custom:weather-equipment-guide
entity: weather.openweathermap
hours: 4
rules:
    umbrella: '%>10'     # precipitation chance in at least one of the next four hours is over 10%
    coat: 'C<18'         # at least one of the next four hours has a temperature forecast of under 18°C
    gloves: 'C<5'        # temperature is forecasted to drop under 5°C at some point in the next four hours
    sunglasses: 'C>25'   # there's no rule for checking the forecast type yet, so for now let's just check temperature
```

## Development notes

* The rule definition language is pure proof-of-concept and will definitely be re-envisioned from scratch.
* There is absolutely no error checking. If you supply an invalid weather forecast entity, or give any option in the wrong format, the behavior will be entirely undefined.
* Anyone got any ideas for a nicer, more concise and less (painfully!) descriptive card name?
* Currently doesn't come prepackaged with any icons, partially for legal reasons, partially because I feel like everybody'll have their own preferences anyway.
* I have no idea what HA's best practices around icon sizes are. These are just what I prefer.
* Most configuration parameters will eventually get renamed.
* The card leaves too much debug information in the browser log.
