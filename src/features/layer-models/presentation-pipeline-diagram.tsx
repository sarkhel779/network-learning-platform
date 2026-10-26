type PipelineIconKind = "data" | "compressed" | "locked";

const PIPELINE_STAGES = [
  {
    step: 1,
    name: "Original data",
    kicker: null,
    icon: "data",
    detail: "Your webcam frame, before any Presentation-layer processing.",
  },
  {
    step: 2,
    name: "Compressed",
    kicker: "Compress",
    icon: "compressed",
    detail: "The binary shrinks (lossy for video) to save bandwidth.",
  },
  {
    step: 3,
    name: "Encrypted",
    kicker: "Encrypt (TLS/SSL)",
    icon: "locked",
    detail: "The compressed binary is scrambled so only your friend's app can read it.",
  },
  {
    step: 4,
    name: "Encrypted",
    kicker: "Travels the network",
    icon: "locked",
    detail: "The same scrambled bytes arrive at your friend's device.",
  },
  {
    step: 5,
    name: "Compressed",
    kicker: "Decrypt",
    icon: "compressed",
    detail: "Your friend's app unscrambles the bytes back to compressed form.",
  },
  {
    step: 6,
    name: "Original data",
    kicker: "Decompress",
    icon: "data",
    detail: "Expanded back into the original frame, ready to display.",
  },
] as const satisfies readonly {
  step: number;
  name: string;
  kicker: string | null;
  icon: PipelineIconKind;
  detail: string;
}[];

function PipelineIcon({ kind }: { kind: PipelineIconKind }) {
  const common = { "aria-hidden": true, viewBox: "0 0 32 32", className: "presentation-pipeline__icon-svg" } as const;

  if (kind === "data") {
    return (
      <svg {...common}>
        <rect x="6" y="7" width="20" height="18" rx="2" />
        <path d="M10 13h12M10 17h12M10 21h8" />
      </svg>
    );
  }
  if (kind === "compressed") {
    return (
      <svg {...common}>
        <rect x="10" y="9" width="12" height="14" rx="2" />
        <path d="M5 11l4 4-4 4M27 11l-4 4 4 4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="9" y="15" width="14" height="11" rx="2" />
      <path d="M12 15v-4a4 4 0 0 1 8 0v4" />
      <circle cx="16" cy="20.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PresentationPipelineDiagram() {
  return (
    <div className="presentation-pipeline" data-presentation-pipeline-diagram>
      <p className="presentation-pipeline__intro">
        A closer look at the Presentation layer's own pipeline: the same packet of video data,
        compressed and encrypted on the way out, then decrypted and decompressed on the way in.
      </p>
      <ol className="presentation-pipeline__list">
        {PIPELINE_STAGES.map((stage) => (
          <li className="presentation-pipeline__stage" data-pipeline-step={stage.step} key={stage.step}>
            <span className="presentation-pipeline__marker" aria-hidden="true">
              <PipelineIcon kind={stage.icon} />
            </span>
            <span className="presentation-pipeline__text">
              {stage.kicker ? <span className="presentation-pipeline__kicker">{stage.kicker}</span> : null}
              <strong>{stage.name}</strong>
              <span>{stage.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
