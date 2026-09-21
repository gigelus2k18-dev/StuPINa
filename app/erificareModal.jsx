"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function VerificareModal({ familia, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [verification, setVerification] = useState({
    data_verificare: new Date().toISOString().split("T")[0],
    matca: familia.matca || "",
    are_matca:
      familia.are_matca !== undefined
        ? familia.are_matca
        : familia.matca === "Da",
    an_matca: familia.an_matca || "",
    rame: familia.rame || "",
    rame_puiet: familia.rame_puiet || "",
    rame_miere: familia.rame_miere || "",
    rame_polen: familia.rame_polen || "",
    observatii: familia.observatii || "",
  });

  async function saveVerification() {
    if (!familia) return;
    setSaving(true);
    const esteStup = familia.tipFamilie === "Stup";

    const verificationData = {
      data_verificare: verification.data_verificare,
      matca: verification.matca || null,
      are_matca: verification.are_matca,
      an_matca: verification.an_matca ? Number(verification.an_matca) : null,
      rame: verification.rame ? Number(verification.rame) : 0,
      rame_puiet: verification.rame_puiet ? Number(verification.rame_puiet) : 0,
      rame_miere: verification.rame_miere ? Number(verification.rame_miere) : 0,
      rame_polen: verification.rame_polen ? Number(verification.rame_polen) : 0,
      observatii: verification.observatii || null,
      [esteStup ? "stup_id" : "roi_id"]: familia.id,
    };

    const { error: verificationError } = await supabase
      .from("verificari")
      .insert([verificationData]);

    if (verificationError) {
      console.error("EROARE VERIFICARE:", verificationError);
      alert("Eroare la salvarea verificării:\n\n" + verificationError.message);
      setSaving(false);
      return;
    }

    const updateData = {
      matca: verification.matca || null,
      are_matca: verification.are_matca,
      an_matca: verification.an_matca ? Number(verification.an_matca) : null,
      rame: verification.rame ? Number(verification.rame) : 0,
      rame_puiet: verification.rame_puiet ? Number(verification.rame_puiet) : 0,
      rame_miere: verification.rame_miere ? Number(verification.rame_miere) : 0,
      rame_polen: verification.rame_polen ? Number(verification.rame_polen) : 0,
      observatii: verification.observatii || null,
    };

    const tabel = esteStup ? "stupi" : "roiuri";
    const { error: updateError } = await supabase
      .from(tabel)
      .update(updateData)
      .eq("id", familia.id);

    if (updateError) {
      console.error("EROARE UPDATE:", updateError);
      alert("Verificarea a fost salvată, dar datele familiei nu au putut fi actualizate.");
    } else {
      alert("Verificarea a fost salvată!");
    }

    setSaving(false);
    if (onSaved) onSaved();
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2>
            📝 Verificare {familie.tipFamilie} #{familie.numar}
          </h2>
          <button onClick={onClose} style={styles.close}>✕</button>
        </div>

        <div style={styles.formGrid}>
          <label>
            Data
            <input
              type="date"
              value={verification.data_verificare}
              onChange={(e) =>
                setVerification({ ...verification, data_verificare: e.target.value })
              }
              style={styles.input}
            />
          </label>

          <label>
            Rasa matcă
            <input
              value={verification.matca}
              onChange={(e) =>
                setVerification({ ...verification, matca: e.target.value })
              }
              style={styles.input}
              placeholder="Ex: Carnica"
            />
          </label>

          <label>
            Are matcă?
            <select
              value={verification.are_matca ? "Da" : "Nu"}
              onChange={(e) =>
                setVerification({
                  ...verification,
                  are_matca: e.target.value === "Da",
                })
              }
              style={styles.input}
            >
              <option value="Da">Da</option>
              <option value="Nu">Nu</option>
            </select>
          </label>

          <label>
            An matcă
            <input
              type="number"
              value={verification.an_matca}
              onChange={(e) =>
                setVerification({ ...verification, an_matca: e.target.value })
              }
              style={styles.input}
            />
          </label>

          <label>
            Rame
            <input
              type="number"
              value={verification.rame}
              onChange={(e) =>
                setVerification({ ...verification, rame: e.target.value })
              }
              style={styles.input}
            />
          </label>

          <label>
            Rame puiet
            <input
              type="number"
              value={verification.rame_puiet}
              onChange={(e) =>
                setVerification({ ...verification, rame_puiet: e.target.value })
              }
              style={styles.input}
            />
          </label>

          <label>
            Rame miere
            <input
              type="number"
              value={verification.rame_miere}
              onChange={(e) =>
                setVerification({ ...verification, rame_miere: e.target.value })
              }
              style={styles.input}
            />
          </label>

          <label>
            Rame polen
            <input
              type="number"
              value={verification.rame_polen}
              onChange={(e) =>
                setVerification({ ...verification, rame_polen: e.target.value })
              }
              style={styles.input}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Observații
            <textarea
              value={verification.observatii}
              onChange={(e) =>
                setVerification({ ...verification, observatii: e.target.value })
              }
              style={styles.textarea}
              rows={4}
            />
          </label>
        </div>

        <button onClick={saveVerification} disabled={saving} style={styles.saveButton}>
          {saving ? "Se salvează..." : "💾 Salvează verificarea"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "14px",
    padding: "25px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  close: {
    border: "none",
    background: "transparent",
    fontSize: "22px",
    cursor: "pointer",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },
  input: {
    display: "block",
    width: "100%",
    marginTop: "6px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    boxSizing: "border-box",
  },
  textarea: {
    display: "block",
    width: "100%",
    marginTop: "6px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  saveButton: {
    width: "100%",
    marginTop: "20px",
    padding: "13px",
    background: "#167a42",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
