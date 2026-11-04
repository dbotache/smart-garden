/**
 * Public API of the smart-garden prototype module. The presentation imports ONLY from here.
 */
export { GardenScene, type GardenSceneProps } from "./components/GardenScene";
export * from "./types";
export { PLANTS, RECOMMENDED_PLANTS, EXISTING_PLANTS, getPlant } from "./data/plants";
export { PLANTING_ZONES } from "./data/site";
export { SENSOR_DEVICES, getDeviceSeries } from "./data/sensors";
export { IRRIGATION_ZONES, WEATHER_SCENARIOS } from "./data/irrigation";
export { planIrrigation, compareModes, decideAdaptive } from "./utils/irrigationLogic";
export { demoRecommendationProvider, createHttpRecommendationProvider, type RecommendationProvider } from "./data/recommendations";
export { getMessages } from "./data/i18n";
export { parseStage, isGardenStage } from "./utils/stages";
