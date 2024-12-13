import type { Forecasts, ForecastSegment } from './forecast';
import { Rule, Recommendation } from './types';


export const exampleRuleset = [
    'umbrella: %>10',
    'scarf: C<20',
    'coat: C<15',
    'hat: C<12',
    'gloves: C<8',
    'sunglasses: C>20'
];


export function parseRuleDescriptor(descriptor: string): Rule {
    const re = /(?<recommendation>\w+): (?<field>[C%])(?<operator>[<>])(?<threshold>\d+)/;
    const match = descriptor.match(re);
    const fieldLookupTable = {
        "C": "temperature",
        "%": "precipitation_probability",
    };
    if (match)
        return {
            recommendation: match.groups!.recommendation as Recommendation,
            field: fieldLookupTable[match.groups!.field],
            operator: match.groups!.operator === '<' ? '<' : '>',
            threshold: Number(match.groups!.threshold),
        }
    else
        throw new Error('invalid descriptor');
}

function applyRule(rule: Rule, forecast: ForecastSegment): Recommendation | null {
    var fieldValue;
    switch (rule.field) {
        case 'temperature': fieldValue = forecast.temperature; break;
        case 'precipitation_probability': fieldValue = forecast.precipitation_probability; break;
        default: throw new Error("unexpected field value");
    }
    // console.log(rule.recommendation, ":", fieldValue, rule.operator, rule.threshold);
    if (rule.operator === '<') {
        if (fieldValue < rule.threshold) return rule.recommendation;
    } else {
        if (fieldValue > rule.threshold) return rule.recommendation;
    }
    return null;
}

export function giveRecommendations(rules: Rule[], forecasts: Forecasts): Set<Recommendation> {
    let recommendations: Set<Recommendation> = new Set();
    for (const forecast of forecasts) {
        for (const rule of rules) {
            const recommendation = applyRule(rule!, forecast);
            // console.log(`Rule check: ${rule.field} ${rule.operator} ${rule.threshold} => ${recommendation}`);
            if (recommendation)
                recommendations.add(recommendation);
        }
    }
    return recommendations;
}
