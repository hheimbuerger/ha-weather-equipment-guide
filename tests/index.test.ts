import { parseRuleDescriptor, giveRecommendations } from '../src/ruleset';
import { ForecastSegment } from '../src/forecast';
import { Recommendation } from '../src/types';


function declareForecast({
    clouds = 0,
    condition = "cloudy",
    precipitation = 0,
    precipitation_probability = 0,
    pressure = 1000,
    temperature = 20,
    wind_bearing = 0,
    wind_speed = 0,
}: any): ForecastSegment {
    return {
        clouds,
        condition,
        datetime: "2022-06-03T22:00:00+00:00",
        precipitation,
        precipitation_probability,
        pressure,
        temperature,
        wind_bearing,
        wind_speed
    }
}


function expectWeather({weather, rules}) {
    const processedRules = rules.map((rule) => parseRuleDescriptor(rule));
    const processedWeather = weather.map((weather) => declareForecast(weather));

    const recommendations = giveRecommendations(processedRules, processedWeather);

    return expect(Array.from(recommendations))
}


describe('testing weather recommendations', () => {
    test('in default weather, there should be no recommendations', () => {
        expectWeather({
            weather: [],
            rules: [],
        }).toEqual([]);
    });

    test('if rain is expected in the next hour, an umbrella should be recommended', () => {
        expectWeather({
            weather: [
                {
                    condition: 'rainy',
                    precipitation: 50,
                    precipitation_probability: 100
                }
            ],
            rules: ["umbrella: %>80"]
        }).toContain(Recommendation.Umbrella);
    });

    const coldSunnyWinterDay = {
        condition: 'clear',
        precipitation: 0,
        precipitation_probability: 0,
        temperature: 3,
    };

    test('if no rain is expected, no umbrella should be recommended', () => {
        expectWeather({
            weather: [coldSunnyWinterDay],
            rules: ["umbrella: %>80"]
        }).not.toContain(Recommendation.Umbrella);
    });

    test('if very cold, scarf/coat/gloves should be recommended', () => {
        expectWeather({
            weather: [coldSunnyWinterDay],
            rules: [
                "scarf: C<20",
                "coat: C<16",
                "gloves: C<5",
            ]
        }).toEqual(expect.arrayContaining([Recommendation.Scarf, Recommendation.Coat, Recommendation.Gloves]));
    });

    test('if sunny and hot, sunglasses should be recommended', () => {
        expectWeather({
            weather: [{
                condition: 'sunny',
                temperature: 25,
            }],
            rules: [
                "sunglasses: C>20",
            ]
        }).toContain(Recommendation.Sunglasses);
    });

    test('even if the weather will swing around to rain in two hours, an umbrella should still be recommended', () => {
        expectWeather({
            weather: [
                {},
                {},
                {
                    condition: 'rainy',
                    precipitation_probability: 90,
                }
            ],
            rules: [
                "umbrella: %>80",
            ]
        }).toContain(Recommendation.Umbrella);
    });

});
