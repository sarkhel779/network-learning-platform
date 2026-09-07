import { EncapsulationPlayer } from "./encapsulation-player";
import { layerModelsLab } from "./layer-models.data";

export function EncapsulationExperience() {
  return <EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />;
}
