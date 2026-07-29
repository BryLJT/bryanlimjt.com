"use client"

import { useReducer } from "react"
import { SimConfig } from "@/lib/forceSim"

type TunableKey = Exclude<keyof SimConfig, "centerX" | "centerY" | "alphaMin" | "repelDistanceMin">

const SLIDERS: { key: TunableKey; label: string; min: number; max: number; step: number }[] = [
  { key: "repelStrength",    label: "Repel strength",  min: -200,  max: 0,   step: 1     },
  { key: "repelDistanceMax", label: "Repel max dist",  min: 50,    max: 1000, step: 10   },
  { key: "linkDistance",     label: "Link distance",   min: 20,    max: 300, step: 5     },
  { key: "linkStrengthMult", label: "Link strength ×", min: 0,     max: 3,   step: 0.05  },
  { key: "centerStrength",   label: "Center force",    min: 0,     max: 0.3, step: 0.005 },
  { key: "velocityDecay",    label: "Velocity decay",  min: 0,     max: 0.9, step: 0.01  },
  { key: "alphaDecay",       label: "Alpha decay",     min: 0.001, max: 0.1, step: 0.001 },
  { key: "reheatTarget",     label: "Drag reheat",     min: 0,     max: 1,   step: 0.05  },
]

type Props = {
  config: SimConfig   // the sim's live config object — sliders mutate it in place
  reheat: () => void  // pulse the sim so a change is visible while it sleeps
}

export default function GraphTuningPanel({ config, reheat }: Props) {
  const [, rerender] = useReducer((n: number) => n + 1, 0)

  return (
    <div
      style={{
        position: "absolute", top: 12, right: 12, zIndex: 10, width: 230,
        background: "rgba(6,13,20,0.92)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8, padding: "12px 14px", fontSize: 11, lineHeight: 1.3,
        color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Physics tuning — press g to hide</div>
      {SLIDERS.map(s => (
        <label key={s.key} style={{ display: "block", marginBottom: 6 }}>
          {s.label}: {Number(config[s.key].toPrecision(3))}
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={config[s.key]}
            onChange={e => {
              config[s.key] = Number(e.target.value)
              reheat()
              rerender()
            }}
            style={{ width: "100%", display: "block" }}
          />
        </label>
      ))}
    </div>
  )
}
