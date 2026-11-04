import type { GardenSelection, GardenStage } from "../types";
import { getPlant, plantForZone } from "../data/plants";
import { SENSOR_DEVICES, probeForPlant } from "../data/sensors";

/**
 * Carry a selection across stages instead of dropping it: selecting bed 1 while planning shows the tomato
 * once plants exist, and the tomato's soil probe while monitoring. Returns null when nothing meaningful maps.
 */
export function selectionForStage(selection: GardenSelection, stage: GardenStage): GardenSelection {
  if (!selection) return null;
  const plantIdOf = (s: NonNullable<GardenSelection>): string | undefined => {
    if (s.type === "plant") return getPlant(s.id) ? s.id : undefined;
    if (s.type === "zone") return plantForZone(s.id)?.id;
    const device = SENSOR_DEVICES.find((d) => d.id === s.id);
    return device?.plantingZoneId ? plantForZone(device.plantingZoneId)?.id : undefined;
  };

  switch (stage) {
    case "planning": {
      if (selection.type === "zone") return selection;
      const plant = getPlant(plantIdOf(selection) ?? "");
      return plant ? { type: "zone", id: plant.plantingZoneId } : null;
    }
    case "planting": {
      const id = plantIdOf(selection);
      return id ? { type: "plant", id } : null;
    }
    case "monitoring":
    case "irrigation": {
      if (selection.type === "sensor") return SENSOR_DEVICES.some((d) => d.id === selection.id) ? selection : null;
      const id = plantIdOf(selection);
      return id ? { type: "plant", id } : null;
    }
  }
}

/** The soil probe to show for a selection in the monitoring stage (plants map to their bed's probe). */
export function deviceForSelection(selection: GardenSelection) {
  if (!selection) return undefined;
  if (selection.type === "sensor") return SENSOR_DEVICES.find((d) => d.id === selection.id);
  if (selection.type === "plant") return probeForPlant(selection.id);
  return SENSOR_DEVICES.find((d) => d.plantingZoneId === selection.id);
}
