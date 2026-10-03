"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { CmsSaveForm, CmsSubmitButton } from "@/components/cms-save-form";
import { saveCmsSections } from "@/app/admin/cms-actions";

export type SectionItem = {
  id: string;
  label: string;
  anchor: string;
  visible: boolean;
  headline: string;
  subheadline: string;
  cta: string;
  heroAppId: string;
  metrics: Array<{ value: string; label: string }>;
};

export function SectionsEditor({ initial, apps }: { initial: SectionItem[]; apps: Array<{ id: string; title: string }> }) {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState(initial[0]?.id ?? "");
  const [dragged, setDragged] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const current = items.find((item) => item.id === selected);

  function update(id: string, patch: Partial<SectionItem>) {
    setItems((old) => old.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((old) => {
      const next = [...old];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function endDrag() {
    setDragged(null);
    setDropTarget(null);
  }

  return (
    <CmsSaveForm action={saveCmsSections} className="cms-section-grid">
      <input type="hidden" name="sections" value={JSON.stringify(items)} />

      <div className="cms-card">
        <div className="cms-card-heading">
          <span className="cms-mono">Landing sections · drag to reorder</span>
        </div>
        <p className="cms-help">Save changes to update section visibility, content, and order immediately.</p>

        <div className="cms-section-list">
          {items.map((item, index) => (
            <div
              className={`cms-section-row${dragged === item.id ? " is-dragging" : ""}${dropTarget === item.id ? " is-drop-target" : ""}`}
              key={item.id}
              onDragOver={(event) => {
                event.preventDefault();
                if (dragged && dragged !== item.id) setDropTarget(item.id);
              }}
              onDrop={() => {
                if (dragged) move(items.findIndex((row) => row.id === dragged), index);
                endDrag();
              }}
            >
              <button
                type="button"
                className="cms-drag-handle"
                draggable
                onDragStart={() => setDragged(item.id)}
                onDragEnd={endDrag}
                aria-label={`Drag ${item.label} to reorder`}
                title="Drag to reorder"
              >
                <GripVertical size={16} aria-hidden="true" />
              </button>
              <span className="cms-row-number">{String(index + 1).padStart(2, "0")}</span>
              <button type="button" className="cms-section-name" onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}>
                <strong>{item.label}</strong>
                <small>{item.anchor}</small>
              </button>
              <div className="cms-reorder-actions" aria-label={`Reorder ${item.label}`}>
                <button type="button" aria-label={`Move ${item.label} up`} title="Move up" onClick={() => move(index, index - 1)} disabled={index === 0}>
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button type="button" aria-label={`Move ${item.label} down`} title="Move down" onClick={() => move(index, index + 1)} disabled={index === items.length - 1}>
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
              </div>
              <label className="cms-toggle" data-state={item.visible ? "visible" : "hidden"}>
                <input
                  type="checkbox"
                  role="switch"
                  checked={item.visible}
                  onChange={(event) => update(item.id, { visible: event.target.checked })}
                  aria-label={`${item.label} visibility`}
                />
                <span className="cms-toggle-track" aria-hidden="true"><span /></span>
                <span className="cms-toggle-copy"><strong>{item.visible ? "Visible" : "Hidden"}</strong><small>{item.visible ? "Shown on site" : "Hidden from site"}</small></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <aside className="cms-section-aside">
        <div className="cms-card">
          <span className="cms-mono">Section settings</span>
          {current && <div className="cms-section-fields">
            <div className="cms-field"><label htmlFor="section-headline">Headline · {current.label}</label><input id="section-headline" value={current.headline} onChange={(event) => update(current.id, { headline: event.target.value })} /></div>
            <div className="cms-field"><label htmlFor="section-subheadline">Subheadline</label><input id="section-subheadline" value={current.subheadline} onChange={(event) => update(current.id, { subheadline: event.target.value })} /></div>
            <div className="cms-field"><label htmlFor="section-cta">Primary CTA</label><input id="section-cta" value={current.cta} onChange={(event) => update(current.id, { cta: event.target.value })} /></div>
            {current.id === "hero" && <>
              <div className="cms-field"><label htmlFor="hero-app">Hero app</label><select id="hero-app" value={current.heroAppId} onChange={(event) => update(current.id, { heroAppId: event.target.value })}><option value="">No app selected</option>{apps.map((app) => <option key={app.id} value={app.id}>{app.title}</option>)}</select></div>
              <div className="cms-field"><label>Verified metrics</label>{[0, 1, 2].map((metricIndex) => {
                const metric = current.metrics[metricIndex] ?? { value: "", label: "" };
                return <div className="cms-form-grid" key={metricIndex}><input aria-label={`Metric ${metricIndex + 1} value`} value={metric.value} onChange={(event) => { const metrics = [...current.metrics]; metrics[metricIndex] = { ...metric, value: event.target.value }; update(current.id, { metrics }); }} placeholder="Value" /><input aria-label={`Metric ${metricIndex + 1} label`} value={metric.label} onChange={(event) => { const metrics = [...current.metrics]; metrics[metricIndex] = { ...metric, label: event.target.value }; update(current.id, { metrics }); }} placeholder="Label" /></div>;
              })}</div>
            </>}
          </div>}
        </div>
        <CmsSubmitButton>Save changes</CmsSubmitButton>
      </aside>
    </CmsSaveForm>
  );
}
