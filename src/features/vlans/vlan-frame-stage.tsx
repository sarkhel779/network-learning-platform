type VlanFrameStageProps = Readonly<{ tagged: boolean; vlan: 10 | 20; technical: boolean }>;

export function VlanFrameStage({ tagged, vlan, technical }: VlanFrameStageProps) {
  const fields = ["Destination MAC", "Source MAC", ...(tagged ? [`802.1Q tag — VLAN ${vlan}`] : []), "EtherType", "Payload", "FCS"];
  return <section className="vlan-frame-stage" aria-label={`Ethernet frame ${tagged ? `tagged for VLAN ${vlan}` : "without an 802.1Q tag"}`}>
    <ol className="vlan-frame-stage__fields">
      {fields.map((field) => <li className="vlan-frame-stage__field" key={field}>{field}</li>)}
    </ol>
    {tagged && technical ? <dl className="vlan-frame-stage__tag-details">
      <div><dt>TPID</dt><dd>0x8100</dd></div>
      <div><dt>Priority</dt><dd>PCP 0</dd></div>
      <div><dt>Drop eligibility</dt><dd>DEI 0</dd></div>
      <div><dt>Membership</dt><dd>VLAN ID {vlan}</dd></div>
      <div><dt>Encapsulated protocol</dt><dd>EtherType 0x0800 (IPv4)</dd></div>
    </dl> : null}
  </section>;
}
