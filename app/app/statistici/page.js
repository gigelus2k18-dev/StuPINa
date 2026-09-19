"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Statistici() {
  const [stupi, setStupi] = useState([]);
  const [tratamente, setTratamente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: stupiData, error: stupiError } =
      await supabase
        .from("stupi")
        .select("*")
        .order("numar_stup", {
          ascending: true,
        });

    const { data: tratamenteData, error: tratamenteError } =
      await supabase
        .from("tratamente")
        .select("*")
        .order("data_tratament", {
          ascending: false,
        });

    if (stupiError || tratamenteError) {
      console.error(
        stupiError || tratamenteError
      );

      alert(
        "Nu s-au putut încărca statisticile."
      );
    } else {
      setStupi(stupiData || []);
      setTratamente(tratamenteData || []);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <h1>📊 Statistici</h1>
        <p>Se încarcă...</p>
      </main>
    );
  }

  const totalMiere = stupi.reduce(
    (sum, stup) =>
      sum + Number(stup.miere_kg || 0),
    0
  );

  const totalRame = stupi.reduce(
    (sum, stup) =>
      sum + Number(stup.rame || 0),
    0
  );

  const totalPuiet = stupi.reduce(
    (sum, stup) =>
      sum + Number(stup.rame_puiet || 0),
    0
  );

  const totalMiereRame = stupi.reduce(
    (sum, stup) =>
      sum + Number(stup.rame_miere || 0),
    0
  );

  const totalPolen = stupi.reduce(
    (sum, stup) =>
      sum + Number(stup.rame_polen || 0),
    0
  );

  const cuMatca = stupi.filter(
    (stup) => stup.matca
  ).length;

  const faraMatca =
    stupi.length - cuMatca;

  const puternici = stupi.filter(
    (stup) =>
      stup.status?.toLowerCase() ===
      "puternic"
  ).length;

  const medii = stupi.filter(
    (stup) =>
      stup.status?.toLowerCase() ===
      "mediu"
  ).length;

  const slabi = stupi.filter(
    (stup) =>
      stup.status?.toLowerCase() ===
      "slab"
  ).length;

  const amitraz = tratamente.filter(
    (t) => t.tip === "Amitraz"
  ).length;

  const oxalic = tratamente.filter(
    (t) => t.tip === "Acid oxalic"
  ).length;

  return (
    <main style={styles.page}>

      <header style={styles.header}>

        <Link
          href="/"
          style={styles.backButton}
        >
          ← Înapoi
        </Link>

        <div>
          <h1 style={styles.title}>
            📊 Statistici StuPINa
          </h1>

          <p style={styles.subtitle}>
            Situația generală a stupinei
          </p>
        </div>

      </header>

      <section style={styles.grid}>

        <StatCard
          title="Total stupi"
          value={stupi.length}
          icon="🐝"
        />

        <StatCard
          title="Cu matcă"
          value={cuMatca}
          icon="👑"
        />

        <StatCard
          title="Fără matcă"
          value={faraMatca}
          icon="⚠️"
        />

        <StatCard
          title="Total rame"
          value={totalRame}
          icon="🪵"
        />

        <StatCard
          title="Rame cu puiet"
          value={totalPuiet}
          icon="🐣"
        />

        <StatCard
          title="Rame cu miere"
          value={totalMiereRame}
          icon="🍯"
        />

        <StatCard
          title="Rame cu polen"
          value={totalPolen}
          icon="🌼"
        />

        <StatCard
          title="Miere"
          value={`${totalMiere.toFixed(1)} kg`}
          icon="⚖️"
        />

      </section>

      <section style={styles.section}>

        <h2>📊 Statusul stupinei</h2>

        <div style={styles.statusGrid}>

          <div style={styles.statusCard}>
            <span>🟢 Puternici</span>
            <strong>{puternici}</strong>
          </div>

          <div style={styles.statusCard}>
            <span>🟡 Medii</span>
            <strong>{medii}</strong>
          </div>

          <div style={styles.statusCard}>
            <span>🔴 Slabi</span>
            <strong>{slabi}</strong>
          </div>

        </div>

      </section>

      <section style={styles.section}>

        <h2>💊 Tratamente</h2>

        <div style={styles.statusGrid}>

          <div style={styles.statusCard}>
            <span>Amitraz</span>
            <strong>{amitraz}</strong>
            <small>înregistrări</small>
          </div>

          <div style={styles.statusCard}>
            <span>Acid oxalic</span>
            <strong>{oxalic}</strong>
            <small>înregistrări</small>
          </div>

          <div style={styles.statusCard}>
            <span>Total tratamente</span>
            <strong>
              {tratamente.length}
            </strong>
            <small>înregistrări</small>
          </div>

        </div>

      </section>

      <section style={styles.section}>

        <h2>📜 Ultimele tratamente</h2>

        {tratamente.length === 0 ? (

          <p>
            Nu există încă tratamente
            înregistrate.
          </p>

        ) : (

          <div style={styles.treatmentList}>

            {tratamente
              .slice(0, 20)
              .map((tratament) => {

                const stup = stupi.find(
                  (s) =>
                    s.id ===
                    tratament.stup_id
                );

                return (
                  <div
                    key={tratament.id}
                    style={styles.treatmentItem}
                  >

                    <strong>
                      {tratament.tip}
                    </strong>

                    <span>
                      {stup
                        ? `Stupul ${stup.numar_stup}`
                        : "Stup necunoscut"}
                    </span>

                    <span>
                      {tratament.data_tratament}
                    </span>

                    {tratament.detalii && (
                      <span>
                        {tratament.detalii}
                      </span>
                    )}

                  </div>
                );
              })}

          </div>

        )}

      </section>

    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div style={styles.card}>

      <div style={styles.icon}>
        {icon}
      </div>

      <div>
        <div style={styles.cardTitle}>
          {title}
        </div>

        <div style={styles.value}>
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
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },

  backButton: {
    padding: "10px 16px",
    background: "#222",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    color: "#777",
    marginTop: "5px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.07)",
  },

  icon: {
    fontSize: "30px",
  },

  cardTitle: {
    color: "#777",
    fontSize: "13px",
  },

  value: {
    fontSize: "25px",
    fontWeight: "bold",
    marginTop: "5px",
  },

  section: {
    background: "#fff",
    borderRadius: "14px",
    padding: "25px",
    marginTop: "25px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.06)",
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginTop: "15px",
  },

  statusCard: {
    background: "#f7f7f7",
    padding: "18px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  treatmentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "15px",
  },

  treatmentItem: {
    display: "grid",
    gridTemplateColumns:
      "150px 120px 120px 1fr",
    gap: "15px",
    padding: "12px",
    background: "#f7f7f7",
    borderRadius: "8px",
  },

};
