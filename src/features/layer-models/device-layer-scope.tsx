import { NetworkDeviceSymbol } from "../packet-flow/network-device-symbol";
import { layerModelsLab } from "./layer-models.data";

const osiLayerNames = new Map(
  layerModelsLab.osiLayers.map((layer) => [layer.number, layer.name]),
);
const tcpIpLayerNames = new Map(
  layerModelsLab.tcpIpLayers.map((layer) => [layer.id, layer.name]),
);

export function DeviceLayerScope() {
  return (
    <section
      aria-labelledby="device-layer-scope-title"
      className="device-layer-scope"
      data-device-layer-scope
    >
      <div className="device-layer-scope__intro">
        <h3 id="device-layer-scope-title">Compare device layer scope</h3>
        <p>
          Devices can inspect more than one layer. These examples describe what each device
          commonly examines for a familiar forwarding or delivery decision.
        </p>
      </div>

      <ul className="device-layer-scope__list">
        {layerModelsLab.deviceScopes.map((scope) => (
          <li className="device-layer-scope__card" data-device-scope={scope.id} key={scope.id}>
            <div className="device-layer-scope__heading">
              <svg
                aria-hidden="true"
                className="device-layer-scope__symbol"
                viewBox="-48 -42 96 84"
              >
                <NetworkDeviceSymbol kind={scope.id} />
              </svg>
              <h4>{scope.name}</h4>
            </div>
            <p className="device-layer-scope__scope"><strong>Layer scope:</strong> {scope.commonlyExamines}</p>
            <p>{scope.explanation}</p>
            <dl className="device-layer-scope__layers">
              <div>
                <dt>OSI</dt>
                <dd>{scope.osiLayers.map((number) => `Layer ${number} (${osiLayerNames.get(number)})`).join(", ")}</dd>
              </div>
              <div>
                <dt>TCP/IP</dt>
                <dd>{scope.tcpIpLayers.map((id) => tcpIpLayerNames.get(id)).join(", ")}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
