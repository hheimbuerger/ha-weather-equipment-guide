export type Rule = {
    recommendation: Recommendation,
    field: string,
    operator: '<' | '>',
    threshold: number,
}

export enum Recommendation {
    Umbrella = 'umbrella',
    Coat = 'coat',
    Gloves = 'gloves',
    Sunglasses = 'sunglasses',
    Sweater = 'sweater',
    Hat = 'hat',
    Scarf = 'scarf',
}
