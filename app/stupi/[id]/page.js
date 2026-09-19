"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function StupPage() {
  const params = useParams();
  const router = useRouter();

  const [stup, setStup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rame, setRame] = useState(0);

  useEffect(() => {
    getStup();
  }, []);

  async function getStup() {
    const { data, error } = await supabase
      .from("stupi")
      .select("*")
      .eq("numar_stup", Number(params.id))
      .single();

    if (error) {
      console.error(error);
      alert("Nu s-au putut încărca datele stupului.");
    } else {
      setStup(data);
      setRame(data.rame || 0);
    }

    setLoading(false);
  }

  async function saveRame(newRame) {
    setRame(newRame);

    const { error } = await supabase
      .from("stupi")
      .update({ rame: newRame })
      .eq("id", stup.id);

    if (error) {
      console.error(error);
      alert("Nu s-a putut salva numărul de rame.");
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <p>Se încarcă stupul...</p>
      </main>
    );
  }

  if (!stup) {
    return (
      <main style={styles.page}>
        <h1>Stupul nu a fost găsit.</h1>
        <button onClick={() => router.push("/")}>
          Înapoi la stupină
        </button>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          style={styles.backButton}
          onClick={() => router.push("/")}
        >
          ← Înapoi la stupină
        </button>

        <div>
          <h1 style={styles.title}>🐝 Stupul {stup.numar_stup}</h1>
          <p style={styles.subtitle}>Fișa stupului</p>
        </div>
      </header>

      <div style={styles.layout}>
        <section style={styles.hiveSection}>
          <div style={styles.queen}>
            <div style={styles.queenTitle}>MATCĂ</div>

            <div style={styles.queenValue}>
              {stup.matca || "Nespecificată"}
            </div>

            <div style={styles.queenYear}>
              {stup.an_matca
                ? `Anul ${stup.an_matca}`
                : "An nespecificat"}
            </div>
          </div>

          <div style={styles.frameControls}>
            <button
              style={styles.frameButton}
              onClick={() => {
                if (rame > 0) saveRame(rame - 1);
              }}
            >
              −
            </button>

            <div style={styles.frameNumber}>
              {rame} rame
            </div>

            <button
              style={styles.frameButton}
              onClick={() => saveRame(rame + 1)}
            >
              +
            </button>
          </div>

          <div style={styles.hive}>
            <div style={styles.hiveRoof}></div>

            <div style={styles.hiveBody}>
              {Array.from({ length: rame || 5 }).map((_, index) => (
                <div
                  key={index}
                  style={styles.frame}
                >
                  <div style={styles.frameInner}>
                    <div style={styles.cells}>
                      ⬡ ⬡ ⬡ ⬡ ⬡
                      <br />
                      ⬡ ⬡ ⬡ ⬡ ⬡
                      <br />
                      ⬡ ⬡ ⬡ ⬡ ⬡
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.hiveBottom}></div>
          </div>

          <div style={styles.hiveLabel}>
            STUPUL {stup.numar_stup}
          </div>
        </section>

        <aside style={styles.panel}>
          <h2 style={styles.panelTitle}>Datele stupului</h2>

          <InfoCard
            label="👑 Matcă"
            value={stup.matca || "Nespecificată"}
          />

          <InfoCard
            label="📅 An matcă"
            value={stup.an_matca || "—"}
          />

          <InfoCard
            label="🪵 Număr rame"
            value={rame || "—"}
          />

          <InfoCard
            label="🐝 Rame cu puiet"
            value={stup.rame_puiet || "—"}
          />

          <InfoCard
            label="🍯 Rame cu miere"
            value={stup.rame_miere || "—"}
          />

          <InfoCard
            label="🌼 Rame cu polen"
            value={stup.rame_polen || "—"}
          />

          <InfoCard
            label="⚖️ Miere"
            value={
              stup.miere_kg
                ? `${stup.miere_kg} kg`
                : "—"
            }
          />

          <InfoCard
            label="📊 Status"
            value={stup.status || "Nespecificat"}
          />

          <div style={styles.observatii}>
            <div style={styles.cardLabel}>📝 Observații</div>
            <div style={styles.observatiiText}>
              {stup.observatii || "Nu există observații."}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoCard({ label, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={styles.cardValue}>{value}</div>
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
    gap: "25px",
    marginBottom: "30px",
  },

  backButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#777",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "30px",
    alignItems: "start",
  },

  hiveSection: {
    background: "#fff",
    borderRadius: "18px",
    padding: "35px",
    minHeight: "650px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
    textAlign: "center",
    position: "relative",
  },

  queen: {
    marginBottom: "20px",
  },

  queenTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    letterSpacing: "3px",
    color: "#777",
  },

  queenValue: {
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: "5px",
  },

  queenYear: {
    color: "#888",
    marginTop: "4px",
  },

  frameControls: {
    position: "absolute",
    top: "25px",
    right: "25px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  frameButton: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "50%",
    background: "#222",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
  },

  frameNumber: {
    fontWeight: "bold",
    minWidth: "70px",
  },

  hive: {
    margin: "50px auto 0",
    width: "360px",
  },

  hiveRoof: {
    height: "45px",
    background: "#555",
    borderRadius: "12px 12px 4px 4px",
    marginBottom: "8px",
  },

  hiveBody: {
    background: "#c9924a",
    borderRadius: "5px",
    padding: "18px",
    minHeight: "300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    gap: "4px",
  },

  frame: {
    background: "#e8b86b",
    width: "42px",
    minHeight: "250px",
    borderRadius: "3px",
    padding: "5px",
    boxSizing: "border-box",
  },

  frameInner: {
    border: "2px solid #b47a35",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  cells: {
    fontSize: "12px",
    lineHeight: "20px",
    color: "#8a5a25",
  },

  hiveBottom: {
    height: "25px",
    background: "#555",
    marginTop: "8px",
    borderRadius: "4px",
  },

  hiveLabel: {
    marginTop: "15px",
    fontWeight: "bold",
    letterSpacing: "2px",
  },

  panel: {
    background: "#fff",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
  },

  panelTitle: {
    marginTop: 0,
    marginBottom: "20px",
  },

  card: {
    padding: "14px",
    borderRadius: "10px",
    background: "#f7f7f7",
    marginBottom: "10px",
  },

  cardLabel: {
    fontSize: "13px",
    color: "#777",
    marginBottom: "5px",
  },

  cardValue: {
    fontSize: "17px",
    fontWeight: "bold",
  },

  observatii: {
    padding: "14px",
    borderRadius: "10px",
    background: "#f7f7f7",
    marginTop: "10px",
  },

  observatiiText: {
    marginTop: "8px",
    lineHeight: "1.5",
  },
};
