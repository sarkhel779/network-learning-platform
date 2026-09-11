import type { ServiceMessage } from "./essential-services.schema";

export function ProtocolMessageInspector({ message }: { message: ServiceMessage }) {
  return (
    <div className="service-message-inspector">
      <h4>{message.name}</h4>
      <div className="service-table-scroll">
        <table aria-label={`${message.name} protocol message`}>
          <thead><tr><th>Field</th><th>Value</th><th>Meaning</th></tr></thead>
          <tbody>{message.fields.map((field) => <tr key={field.name}><th scope="row">{field.name}</th><td>{field.value}</td><td>{field.explanation}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
