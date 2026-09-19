"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function TratamentePage() {
  const [tratamente, setTratamente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtruTip, setFiltruTip] = useState("Toate");
  const [filtruLuna, setFiltruLuna] = useState("Toate");
  const [deletingBatch, setDeletingBatch] = useState(null);

  useEffect(() => {
    getTratamente();
  }, []);

  async function getTratamente() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tratamente")
      .select("*")
      .order("data_tratament", { ascending: false });

    if (error) {
      console.error(error);
      alert(
        "Nu s-au putut încărca tratamentele: " +
          error.message
      );
    } else {
      setTratamente(data || []);
    }

    setLoading(false);
  }

  const tipuri = useMemo(() => {
    return [
      "Toate",
      ...Array.from(
        new Set(
          tratamente
            .map((t) => t.tip)
            .filter(Boolean)
        )
      ),
    ];
  }, [tratamente]);

  const luni = useMemo(() => {
    return [
      "Toate",
      ...Array.from(
        new Set(
          tratamente
            .map((t) =>
              t.data_tratament
                ? t.data_tratament.slice(0, 7)
                : null
            )
            .filter(Boolean)
        )
      ).sort((a, b) => b.localeCompare(a)),
    ];
  }, [tratamente]);

  const tratamenteFiltrate = useMemo(() => {
    return tratamente.filter((tratament) => {
      const tipOK =
        filtruTip === "Toate" ||
        tratament.tip === filtruTip;

      const lunaOK =
        filtruLuna === "Toate" ||
        (tratament.data_tratament || "").startsWith(
          filtruLuna
        );

      return tipOK && lunaOK;
    });
  }, [tratamente, filtruTip, filtruLuna]);

  const batchesMap = {};

  tratamenteFiltrate.forEach((tratament) => {
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
        data_tratament: tratament.data_tratament,
        detalii: tratament.detalii || "",
        count: 0,
      };
    }

    batchesMap[key].count++;
  });

  const batches = Object.values(batchesMap).sort(
    (a, b) =>
      new Date(b.data_tratament) -
      new Date(a.data_tratament)
  );

  async function deleteTreatmentBatch(batch) {
    const confirmare = window.confirm(
      "Sigur vrei să ștergi tratamentul " +
        batch.tip +
        " din " +
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
      .eq("data_tratament", batch.data_tratament);

    if (batch.detalii) {
      query = query.eq("detalii", batch.detalii);
    } else {
      query = query.is("detalii", null);
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

  function formatLuna(luna) {
    if (luna === "Toate") return "Toate lunile";

    const [an, lunaNumar] = luna.split("-");

    const luniNume = [
      "Ianuarie",
      "Februarie",
      "Martie",
      "Aprilie",
      "Mai",
      "Iunie",
      "Iulie",
      "August",
      "Septembrie",
      "Octombrie",
      "Noiembrie",
      "Decembrie",
    ];

    return (
      luniNume[Number(lunaNumar) - 1] +
      " " +
      an
    );
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <h1 style={styles.title}>💊 Tratamente</h1>
        <p>Se încarcă tratamentele...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            💊 Tratamente
          </h1>

          <p style={styles.subtitle}>
            Istoricul tratamentelor din StuPINa
          </p>
        </div>

        <Link
          href="/"
          style={styles.backButton}
        >
          ← Înapoi la StuPINa
        </Link>
      </header>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💊</div>

          <div>
            <div style={styles.statTitle}>
              Înregistrări
            </div>

            <div style={styles.statValue}>
              {tratamenteFiltrate.length}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>

          <div>
            <div style={styles.statTitle}>
              Tranșe
            </div>

            <div style={styles.statValue}>
              {batches.length}
            </div>
          </div>
        </div>
      </section>

      <section style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>
            Tip tratament
          </label>

          <select
            style={styles.input}
            value={filtruTip}
            onChange={(e) =>
              setFiltruTip(e.target.value)
            }
          >
            {tipuri.map((tip) => (
              <option key={tip} value={tip}>
                {tip}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>
            Luna
          </label>

          <select
            style={styles.input}
            value={filtruLuna}
            onChange={(e) =>
              setFiltruLuna(e.target.value)
            }
          >
            {luni.map((luna) => (
              <option key={luna} value={luna}>
                {formatLuna(luna)}
              </option>
            ))}
          </select>
        </div>

        <button
          style={styles.resetButton}
          onClick={() => {
            setFiltruTip("Toate");
            setFiltruLuna("Toate");
          }}
        >
          🔄 Resetează filtrele
        </button>
      </section>

      <section style={styles.content}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              📜 Istoric tratamente
            </h2>

            <p style={styles.sectionSubtitle}>
              Sunt afișate tratamentele grupate pe
              tranșe.
            </p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div style={styles.empty}>
            Nu există tratamente pentru filtrele
            selectate.
          </div>
        ) : (
          <div style={styles.list}>
            {batches.map((batch) => (
              <div
                key={batch.key}
                style={styles.item}
              >
                <div style={styles.itemContent}>
                  <div style={styles.treatmentName}>
                    💊 {batch.tip}
                  </div>

                  <div style={styles.info}>
                    📅 {batch.data_tratament}
                    {" • "}
                    🐝 {batch.count}{" "}
                    {batch.count === 1
                      ? "stup"
                      : "stupi"}
                  </div>

                  {batch.detalii && (
                    <div style={styles.details}>
                      📝 {batch.detalii}
                    </div>
                  )}
                </div>

                <button
                  style={styles.deleteButton}
                  onClick={() =>
                    deleteTreatmentBatch(batch)
                  }
                  disabled={
                    deletingBatch === batch.key
                  }
                >
                  {deletingBatch === batch.key
                    ? "Se șterge..."
                    : "🗑️ Șterge tranșa"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f4f5f2",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#666",
  },

  backButton: {
    padding: "12px 18px",
    background: "#222",
    color: "#fff",
    borderRadius: "9px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
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

  filters: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "25px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
    alignItems: "end",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  filterGroup: {
    minWidth: 0,
  },

  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    background: "#fff",
  },

  resetButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "9px",
    background: "#666",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  content: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
  },

  sectionSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#777",
    fontSize: "14px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "16px",
    background: "#f7f7f7",
    borderRadius: "10px",
    border: "1px solid #eee",
  },

  itemContent: {
    minWidth: 0,
  },

  treatmentName: {
    fontSize: "17px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  info: {
    color: "#777",
    fontSize: "14px",
  },

  details: {
    marginTop: "7px",
    color: "#555",
    fontSize: "14px",
  },

  deleteButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    flexShrink: 0,
  },

  empty: {
    padding: "30px",
    background: "#f7f7f7",
    borderRadius: "10px",
    textAlign: "center",
    color: "#777",
  },
};
