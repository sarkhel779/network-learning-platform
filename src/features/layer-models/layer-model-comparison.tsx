import { layerModelsLab } from "./layer-models.data";

function formatLayerNumbers(numbers: number[]) {
  if (numbers.length === 1) return `${numbers[0]}`;
  if (numbers.length === 2) return `${numbers[0]} and ${numbers[1]}`;
  return `${numbers.slice(0, -1).join(", ")}, and ${numbers.at(-1)}`;
}

export function LayerModelComparison() {
  const tcpIpLayersById = new Map(
    layerModelsLab.tcpIpLayers.map((layer) => [layer.id, layer]),
  );

  return (
    <section
      aria-labelledby="layer-model-comparison-title"
      className="layer-model-comparison"
      data-layer-model-comparison
    >
      <div className="layer-model-comparison__intro">
        <h3 id="layer-model-comparison-title">Compare the models layer by layer</h3>
        <p>
          Read across each mapping to see how the seven conceptual OSI layers fit into the four
          practical TCP/IP layers. Every card names its role and gives protocol examples.
        </p>
      </div>

      <div className="layer-model-comparison__grid">
        <section aria-labelledby="osi-stack-title" className="layer-model-stack">
          <h4 id="osi-stack-title">OSI model — 7 layers</h4>
          <ol className="layer-model-stack__list layer-model-stack__list--osi">
            {layerModelsLab.osiLayers.map((layer) => {
              const mapping = layerModelsLab.mapping.find(({ osiLayers }) =>
                osiLayers.includes(layer.number),
              );

              return (
                <li
                  key={layer.number}
                  className="layer-model-card"
                  data-maps-to-tcp-ip={mapping?.tcpIpLayer}
                  data-osi-layer={layer.number}
                >
                  <p className="layer-model-card__eyebrow">Layer {layer.number}</p>
                  <h5>{layer.name}</h5>
                  <p>{layer.summary}</p>
                  <p className="layer-model-card__examples">
                    <strong>Examples:</strong> {layer.examples.join(", ")}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="mapping-guide-title" className="layer-mapping-guide">
          <h4 id="mapping-guide-title">How the layers map</h4>
          <div className="layer-mapping-guide__entries">
            {layerModelsLab.mapping.map((mapping) => {
              const tcpIpLayer = tcpIpLayersById.get(mapping.tcpIpLayer);
              const layerNumbers = formatLayerNumbers(mapping.osiLayers);

              if (!tcpIpLayer) return null;

              return (
                <article
                  key={mapping.tcpIpLayer}
                  className="layer-mapping-card"
                  data-maps-osi-layers={mapping.osiLayers.join(" ")}
                  data-mapping-to-tcp-ip={mapping.tcpIpLayer}
                >
                  <span
                    aria-hidden="true"
                    className="layer-mapping-card__connector"
                    data-layer-mapping-connector="true"
                  >
                    →
                  </span>
                  <p>
                    <strong>TCP/IP {tcpIpLayer.name}</strong> maps OSI {mapping.osiLayers.length === 1 ? "layer" : "layers"} {layerNumbers}.
                  </p>
                  <p>{mapping.explanation}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="tcp-ip-stack-title" className="layer-model-stack">
          <h4 id="tcp-ip-stack-title">TCP/IP model — 4 layers</h4>
          <ol className="layer-model-stack__list layer-model-stack__list--tcp-ip">
            {layerModelsLab.tcpIpLayers.map((layer) => {
              const mapping = layerModelsLab.mapping.find(
                ({ tcpIpLayer }) => tcpIpLayer === layer.id,
              );

              return (
                <li
                  key={layer.id}
                  className="layer-model-card"
                  data-maps-osi-layers={mapping?.osiLayers.join(" ")}
                >
                  <h5 data-tcp-ip-layer={layer.id}>{layer.name}</h5>
                  <p>{layer.summary}</p>
                  <p className="layer-model-card__examples">
                    <strong>Examples:</strong> {layer.examples.join(", ")}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </section>
  );
}
