import { EncapsulationPlayer } from "./encapsulation-player";
import { layerModelsLab } from "./layer-models.data";

export function EncapsulationExperience({ progressItemId }: { progressItemId?: string }) {
  return <EncapsulationPlayer progressItemId={progressItemId} steps={layerModelsLab.encapsulationSteps} />;
}
