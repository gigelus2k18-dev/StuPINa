```jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [stupi, setStupi] = useState([]);
  const [tratamente, setTratamente] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTreatment, setShowTreatment] = useState(false);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(null);

  const [treatment, setTreatment] = useState({
    tip: "Amitraz",
    data: new Date().toISOString().split("T")[0],
    detalii: "",
  });

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    setLoading(true);

    const {
      data: stupiData,
      error: stupiError,
    } = await supabase
      .from("stupi")
      .select("*")
      .order("numar_stup", {
        ascending: true,
      });

    if (stupiError) {
      console.error(stupiError);
      alert("Nu s-au putut încărca stupii.");
      setLoading(false);
      return;
    }

    setStupi(stupiData || []);

    const {
      data: tratamenteData,
      error: tratamenteError,
    } = await supabase
      .from("tratamente")
      .select("*")
      .order("data_tratament", {
        ascending: false,
      });

    if (tratamenteError) {
      console.error(tratamenteError);
      alert(
        "Nu s-au putut încărca tratamentele: " +
          tratamenteError.message
      );
    } else {
      setTratamente(tratamenteData || []);
    }

    setLoading(false);
  }

  async function applyTreatmentToAll() {
    if (!treatment.tip || !treatment.data) {
      alert("Completează tratamentul și data.");
      return;
    }

    const confirmare = window.confirm(
      "Ești sigur că vrei să adaugi tratamentul \"" +
        treatment.tip +
        "\" pentru toți cei " +
        stupi.length +
        " stupi?"
    );

    if (!confirmare) return;

    setSavingTreatment(true);

    const records = stupi.map((stup) => ({
      stup_id: stup.id,
      tip: treatment.tip,
      data_tratament: treatment.data,
      detalii: treatment.detalii || null,
    }));

    const {
      data,
      error,
    } = await supabase
      .from("tratamente")
      .insert(records)
      .select();

    if (error) {
      console.error(error);

      alert(
        "Eroare la adăugarea tratamentului: " +
          error.message
      );
    } else {
      setTratamente((prev) => [
        ...(data || []),
        ...prev,
      ]);

      alert(
        "Tratamentul a fost adăugat pentru toți cei " +
          stupi.length +
          " stupi!"
      );

      setShowTreatment(false);

      setTreatment({
        tip: "Amitraz",
        data: new Date()
          .toISOString()
          .split("T")[0],
        detalii: "",
      });
    }

    setSavingTreatment(false);
  }

  async function deleteTreatmentBatch(batch) {
    const confirmare = window.confirm(
      "Sigur vrei să ștergi tratamentul \"" +
        batch.tip +
        "\" din " +
        batch.data_tratament +
        " pentru cei " +
        batch.count +
        " stupi?\n\nDetalii: " +
        (batch.detalii || "Fără detalii")
    );

    if (!confirmare) return;

    setDeletingBatch(batch.key);

    let query = supabase
      .from("tratamente")
      .delete()
      .eq("tip", batch.tip)
      .eq(
        "data_tratament",
        batch.data_tratament
      );

    if (batch.detalii) {
      query = query.eq(
        "detalii",
        batch.detalii
      );
    } else {
      query = query.is(
        "detalii",
        null
      );
    }

    const { error } = await query;

    if (error) {
      console.error(error);

      alert(
        "Eroare la ștergere: " +
          error.message
      );
    } else {
      setTratamente((prev) =>
        prev.filter((tratament) => {
          const sameTip =
            tratament.tip === batch.tip;

          const sameDate =
            tratament.data_tratament ===
            batch.data_tratament;

          const sameDetails =
            (tratament.detalii || "") ===
            (batch.detalii || "");

          return !(
            sameTip &&
            sameDate &&
            sameDetails
          );
        })
      );

      alert(
        "Au fost șterse " +
          batch.count +
          " înregistrări."
      );
    }

    setDeletingBatch(null);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <h1 style={styles.title}>
          🐝 StuPINa
        </h1>

        <p>
          Se încarcă stupii...
        </p>
      </main>
    );
  }

  const totalMiere = stupi.reduce(
    (total, stup) =>
      total + Number(stup.miere_kg || 0),
    0
  );

  const totalPuiet = stupi.reduce(
    (total, stup) =>
      total + Number(stup.rame_puiet || 0),
    0
  );

  const totalRameMiere = stupi.reduce(
    (total, stup) =>
      total + Number(stup.rame_miere || 0),
    0
  );

  const totalRamePolen = stupi.reduce(
    (total, stup) =>
      total + Number(stup.rame_polen || 0),
    0
  );

  const cuMatca = stupi.filter(
    (stup) => stup.matca
  ).length;

  const faraMatca =
    stupi.length - cuMatca;

  const batchesMap = {};

  tratamente.forEach((tratament) => {
    const key =
      tratament.tip +
      "|" +
      tratament.data_tratament +
      "|" +
      (tratament.detalii || "");

    if (!batchesMap[key]) {
      batchesMap[key] = {
        key,
        tip: tratament.tip,
        data_tratament:
          tratament.data_tratament,
        detalii:
          tratament.detalii || "",
        count: 0,
      };
    }

    batchesMap[key].count++;
  });

  const treatmentBatches =
    Object.values(batchesMap);

  return (
    <main style={styles.page}>

      {/* HEADER */}

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            🐝 StuPINa
          </h1>

          <p style={styles.subtitle}>
            Gestiunea stupinei
          </p>
        </div>

        <div style={styles.count}>
          {stupi.length} stupi
        </div>
      </header>

      {/* PANOU STATISTICI */}

      <section style={styles.statsGrid}>

        <StatCard
          icon="🐝"
          title="Total stupi"
          value={stupi.length}
        />

        <StatCard
          icon="👑"
          title="Cu matcă"
          value={cuMatca}
        />

        <StatCard
          icon="⚠️"
          title="Fără matcă"
          value={faraMatca}
        />

        <StatCard
          icon="🍯"
          title="Miere"
          value={
            totalMiere.toFixed(1) +
            " kg"
          }
        />

        <StatCard
          icon="🐣"
          title="Rame cu puiet"
          value={totalPuiet}
        />

        <StatCard
          icon="🌼"
          title="Rame cu polen"
          value={totalRamePolen}
        />

        <StatCard
          icon="🍯"
          title="Rame cu miere"
          value={totalRameMiere}
        />

      </section>

      {/* BUTOANE */}

      <section style={styles.actionsSection}>

        <Link
          href="/statistici"
          style={styles.statsButton}
        >
          📊 Statistici complete
        </Link>

        <button
          style={styles.treatmentButton}
          onClick={() =>
            setShowTreatment(true)
          }
        >
          💊 Tratamente pentru toți stupii
        </button>

      </section>

      {/* TRANȘE DE TRATAMENTE */}

      <section style={styles.batchSection}>

        <div style={styles.batchHeader}>

          <h2 style={styles.batchTitle}>
            📜 Tratamente înregistrate
          </h2>

          <p style={styles.batchSubtitle}>
            De aici poți șterge o tranșă
            aplicată mai multor stupi.
          </p>

        </div>

        {treatmentBatches.length === 0 ? (

          <div style={styles.emptyBatches}>
            Nu există tratamente
            înregistrate.
          </div>

        ) : (

          <div style={styles.batchList}>

            {treatmentBatches.map(
              (batch) => (

                <div
                  key={batch.key}
                  style={styles.batchItem}
                >

                  <div
                    style={
                      styles.batchContent
                    }
                  >

                    <div
                      style={
                        styles.batchTreatment
                      }
                    >
                      💊 {batch.tip}
                    </div>

                    <div
                      style={
                        styles.batchInfo
                      }
                    >
                      📅{" "}
                      {batch.data_tratament}
                      {" • "}
                      🐝 {batch.count}{" "}
                      {batch.count === 1
                        ? "stup"
                        : "stupi"}
                    </div>

                    {batch.detalii && (
                      <div
                        style={
                          styles.batchDetails
                        }
                      >
                        📝{" "}
                        {batch.detalii}
                      </div>
                    )}

                  </div>

                  <button
                    style={
                      styles.deleteBatchButton
                    }
                    onClick={() =>
                      deleteTreatmentBatch(
                        batch
                      )
                    }
                    disabled={
                      deletingBatch ===
                      batch.key
                    }
                  >
                    {deletingBatch ===
                    batch.key
                      ? "Se șterge..."
                      : "🗑️ Șterge tranșa"}
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* LISTA STUPILOR */}

      <div style={styles.tableWrapper}>

        <table style={styles.table}>

          <thead>
            <tr>

              <th style={styles.th}>
                Nr. stup
              </th>

              <th style={styles.th}>
                Matcă
              </th>

              <th style={styles.th}>
                An matcă
              </th>

              <th style={styles.th}>
                Rame
              </th>

              <th style={styles.th}>
                Puiet
              </th>

              <th style={styles.th}>
                Miere kg
              </th>

              <th style={styles.th}>
                Polen
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Observații
              </th>

            </tr>
          </thead>

          <tbody>

            {stupi.map((stup) => (

              <tr
                key={stup.id}
                style={styles.row}
              >

                <td
                  style={
                    styles.tdNumber
                  }
                >

                  <Link
                    href={
                      "/stupi/" +
                      stup.numar_stup
                    }
                    style={styles.stupLink}
                  >
                    Stupul{" "}
                    {stup.numar_stup}
                  </Link>

                </td>

                <td style={styles.td}>
                  {stup.matca || "—"}
                </td>

                <td style={styles.td}>
                  {stup.an_matca || "—"}
                </td>

                <td style={styles.td}>
                  {stup.rame || "—"}
                </td>

                <td style={styles.td}>
                  {stup.rame_puiet || "—"}
                </td>

                <td style={styles.td}>
                  {stup.miere_kg
                    ? stup.miere_kg +
                      " kg"
                    : "—"}
                </td>

                <td style={styles.td}>
                  {stup.rame_polen || "—"}
                </td>

                <td style={styles.td}>
                  {stup.status || "—"}
                </td>

                <td style={styles.td}>
                  {stup.observatii || "—"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* FEREASTRA TRATAMENT */}

      {showTreatment && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <button
              style={
                styles.closeButton
              }
              onClick={() =>
                setShowTreatment(false)
              }
            >
              ×
            </button>

            <h2
              style={
                styles.modalTitle
              }
            >
              💊 Tratament pentru toți
              stupii
            </h2>

            <p
              style={
                styles.modalDescription
              }
            >
              Tratamentul va fi adăugat
              în istoricul tuturor
              celor {stupi.length} stupi.
            </p>

            <label
              style={styles.label}
            >
              Tratament
            </label>

            <select
              style={styles.input}
              value={treatment.tip}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  tip: e.target.value,
                })
              }
            >

              <option value="Amitraz">
                Amitraz
              </option>

              <option value="Acid oxalic">
                Acid oxalic
              </option>

              <option value="Acid formic">
                Acid formic
              </option>

              <option value="Alte tratament">
                Alte tratament
              </option>

            </select>

            <label
              style={styles.label}
            >
              Data tratamentului
            </label>

            <input
              style={styles.input}
              type="date"
              value={treatment.data}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  data: e.target.value,
                })
              }
            />

            <label
              style={styles.label}
            >
              Detalii
            </label>

            <textarea
              style={styles.textarea}
              placeholder="Ex: Penultima tranșă, 2 pufuri..."
              value={treatment.detalii}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  detalii: e.target.value,
                })
              }
            />

            <button
              style={
                styles.confirmButton
              }
              onClick={
                applyTreatmentToAll
              }
              disabled={
                savingTreatment
              }
            >
              {savingTreatment
                ? "Se adaugă..."
                : "💾 Aplică la toți cei " +
                  stupi.length +
                  " stupi"}
            </button>

          </div>

        </div>

      )}

    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div style={styles.statCard}>

      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>

        <div style={styles.statTitle}>
          {title}
        </div>

        <div style={styles.statValue}>
          {value}
        </div>

      </div>

    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f4f5f2",
    fontFamily:
      "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#666",
  },

  count: {
    background: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "bold",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  statIcon: {
    fontSize: "28px",
  },

  statTitle: {
    color: "#777",
    fontSize: "13px",
  },

  statValue: {
    fontSize: "23px",
    fontWeight: "bold",
    marginTop: "4px",
  },

  actionsSection: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  statsButton: {
    padding: "12px 18px",
    background: "#222",
    color: "#fff",
    borderRadius: "9px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  treatmentButton: {
    padding: "12px 18px",
    background: "#8a5a25",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  batchSection: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  batchHeader: {
    marginBottom: "15px",
  },

  batchTitle: {
    margin: 0,
    fontSize: "21px",
  },

  batchSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#777",
    fontSize: "14px",
  },

  batchList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  batchItem: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f7f7f7",
    borderRadius: "10px",
    border: "1px solid #eee",
  },

  batchContent: {
    minWidth: 0,
  },

  batchTreatment: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  batchInfo: {
    color: "#777",
    fontSize: "14px",
  },

  batchDetails: {
    marginTop: "6px",
    color: "#555",
    fontSize: "14px",
  },

  emptyBatches: {
    padding: "15px",
    background: "#f7f7f7",
    borderRadius: "9px",
    color: "#777",
  },

  deleteBatchButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    flexShrink: 0,
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "1100px",
  },

  th: {
    padding: "14px",
    textAlign: "left",
    borderBottom:
      "2px solid #ddd",
    background: "#fafafa",
  },

  td: {
    padding: "12px 14px",
    borderBottom:
      "1px solid #eee",
  },

  tdNumber: {
    padding: "12px 14px",
    borderBottom:
      "1px solid #eee",
    fontWeight: "bold",
  },

  stupLink: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#222",
    color: "#fff",
    textDecoration:
      "none",
    fontWeight: "bold",
  },

  row: {
    transition:
      "background 0.2s",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "18px",
    padding: "30px",
    position: "relative",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.2)",
  },

  closeButton: {
    position: "absolute",
    top: "12px",
    right: "15px",
    border: "none",
    background:
      "transparent",
    fontSize: "30px",
    cursor: "pointer",
    color: "#777",
  },

  modalTitle: {
    marginTop: 0,
    marginBottom: "8px",
  },

  modalDescription: {
    color: "#777",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "7px",
    marginTop: "15px",
  },

  input: {
    width: "100%",
    boxSizing:
      "border-box",
    padding: "11px",
    border:
      "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    boxSizing:
      "border-box",
    minHeight: "100px",
    padding: "11px",
    border:
      "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    resize: "vertical",
  },

  confirmButton: {
    width: "100%",
    marginTop: "25px",
    padding: "14px",
    border: "none",
    borderRadius: "9px",
    background: "#2e7d32",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },
};
```
