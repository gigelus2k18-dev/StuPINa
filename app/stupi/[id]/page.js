"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function StupPage() {
  const params = useParams();
  const router = useRouter();

  const [stup, setStup] = useState(null);
  const [tratamente, setTratamente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [deletingTreatment, setDeletingTreatment] = useState(null);

  const [newTreatment, setNewTreatment] = useState({
    tip: "Amitraz",
    data: new Date().toISOString().split("T")[0],
    detalii: "",
  });

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
      setLoading(false);
      return;
    }

    setStup(data);

    const { data: tratamenteData, error: tratamenteError } =
      await supabase
        .from("tratamente")
        .select("*")
        .eq("stup_id", data.id)
        .order("data_tratament", {
          ascending: false,
        });

    if (tratamenteError) {
      console.error(tratamenteError);
      alert("Nu s-a putut încărca istoricul tratamentelor.");
    } else {
      setTratamente(tratamenteData || []);
    }

    setLoading(false);
  }

  function handleChange(field, value) {
    setStup((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveChanges() {
    setSaving(true);

    const { data, error } = await supabase
      .from("stupi")
      .update({
        matca: stup.matca || null,
        an_matca: stup.an_matca
          ? Number(stup.an_matca)
          : null,
        rame: stup.rame
          ? Number(stup.rame)
          : null,
        rame_puiet: stup.rame_puiet
          ? Number(stup.rame_puiet)
          : null,
        rame_miere: stup.rame_miere
          ? Number(stup.rame_miere)
          : null,
        rame_polen: stup.rame_polen
          ? Number(stup.rame_polen)
          : null,
        miere_kg: stup.miere_kg
          ? Number(stup.miere_kg)
          : null,
        status: stup.status || null,
        amitraz: stup.amitraz || null,
        oxalic: stup.oxalic || null,
        alte_tratamente:
          stup.alte_tratamente || null,
        observatii: stup.observatii || null,
      })
      .eq("id", stup.id)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Eroare la salvare: " + error.message);
    } else {
      setStup(data);
      alert("Datele stupului au fost salvate!");
    }

    setSaving(false);
  }

  async function addTreatment() {
    if (!newTreatment.tip || !newTreatment.data) {
      alert("Completează tratamentul și data.");
      return;
    }

    setSavingTreatment(true);

    const { data, error } = await supabase
      .from("tratamente")
      .insert({
        stup_id: stup.id,
        tip: newTreatment.tip,
        data_tratament: newTreatment.data,
        detalii: newTreatment.detalii || null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(
        "Eroare la adăugarea tratamentului: " +
          error.message
      );
    } else {
      setTratamente((prev) =>
        [data, ...prev].sort(
          (a, b) =>
            new Date(b.data_tratament) -
            new Date(a.data_tratament)
        )
      );

      setNewTreatment({
        tip: "Amitraz",
        data: new Date()
          .toISOString()
          .split("T")[0],
        detalii: "",
      });

      alert("Tratamentul a fost adăugat!");
    }

    setSavingTreatment(false);
  }

  async function deleteTreatment(id) {
    const confirmare = window.confirm(
      "Sigur vrei să ștergi acest tratament?"
    );

    if (!confirmare) return;

    setDeletingTreatment(id);

    const { error } = await supabase
      .from("tratamente")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(
        "Eroare la ștergere: " +
          error.message
      );
    } else {
      setTratamente((prev) =>
        prev.filter(
          (tratament) =>
            tratament.id !== id
        )
      );
    }

    setDeletingTreatment(null);
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

        <button
          style={styles.backButton}
          onClick={() => router.push("/")}
        >
          ← Înapoi la stupină
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
          <h1 style={styles.title}>
            🐝 Stupul {stup.numar_stup}
          </h1>

          <p style={styles.subtitle}>
            Fișa stupului
          </p>
        </div>

      </header>

      <div style={styles.layout}>

        {/* STUP */}

        <section style={styles.hiveSection}>

          <div style={styles.queen}>

            <div style={styles.queenTitle}>
              MATCĂ
            </div>

            <input
              style={styles.queenInput}
              value={stup.matca || ""}
              placeholder="Ex: Carnica"
              onChange={(e) =>
                handleChange(
                  "matca",
                  e.target.value
                )
              }
            />

            <div style={styles.queenYear}>
              Anul matcii
            </div>

            <input
              style={styles.yearInput}
              type="number"
              value={stup.an_matca || ""}
              placeholder="2026"
              onChange={(e) =>
                handleChange(
                  "an_matca",
                  e.target.value
                )
              }
            />

          </div>

          <div style={styles.frameControls}>

            <button
              style={styles.frameButton}
              onClick={() =>
                handleChange(
                  "rame",
                  Math.max(
                    0,
                    Number(stup.rame || 0) - 1
                  )
                )
              }
            >
              −
            </button>

            <div style={styles.frameNumber}>
              {stup.rame || 0} rame
            </div>

            <button
              style={styles.frameButton}
              onClick={() =>
                handleChange(
                  "rame",
                  Number(stup.rame || 0) + 1
                )
              }
            >
              +
            </button>

          </div>

          <div style={styles.hive}>

            <div style={styles.hiveRoof}></div>

            <div style={styles.hiveBody}>

              {Array.from({
                length: Math.min(
                  Number(stup.rame || 5),
                  10
                ),
              }).map((_, index) => (

                <div
                  key={index}
                  style={styles.frame}
                >

                  <div
                    style={styles.frameInner}
                  >

                    <div style={styles.cells}>
                      ⬡ ⬡
                      <br />
                      ⬡ ⬡
                      <br />
                      ⬡ ⬡
                      <br />
                      ⬡ ⬡
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


        {/* PANOU */}

        <aside style={styles.panel}>

          <h2 style={styles.panelTitle}>
            Datele stupului
          </h2>

          <EditCard
            label="🐝 Rame cu puiet"
            type="number"
            value={stup.rame_puiet}
            onChange={(value) =>
              handleChange(
                "rame_puiet",
                value
              )
            }
          />

          <EditCard
            label="🍯 Rame cu miere"
            type="number"
            value={stup.rame_miere}
            onChange={(value) =>
              handleChange(
                "rame_miere",
                value
              )
            }
          />

          <EditCard
            label="🌼 Rame cu polen"
            type="number"
            value={stup.rame_polen}
            onChange={(value) =>
              handleChange(
                "rame_polen",
                value
              )
            }
          />

          <EditCard
            label="⚖️ Miere (kg)"
            type="number"
            step="0.1"
            value={stup.miere_kg}
            onChange={(value) =>
              handleChange(
                "miere_kg",
                value
              )
            }
          />

          <EditCard
            label="📊 Status"
            value={stup.status}
            placeholder="Ex: Puternic"
            onChange={(value) =>
              handleChange(
                "status",
                value
              )
            }
          />

          {/* TRATAMENTE */}

          <div style={styles.treatmentSection}>

            <h2 style={styles.treatmentTitle}>
              💊 Tratamente
            </h2>

            <div style={styles.newTreatment}>

              <div style={styles.cardLabel}>
                Adaugă tratament
              </div>

              <select
                style={styles.editInput}
                value={newTreatment.tip}
                onChange={(e) =>
                  setNewTreatment({
                    ...newTreatment,
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

              <input
                style={{
                  ...styles.editInput,
                  marginTop: "8px",
                }}
                type="date"
                value={newTreatment.data}
                onChange={(e) =>
                  setNewTreatment({
                    ...newTreatment,
                    data: e.target.value,
                  })
                }
              />

              <textarea
                style={{
                  ...styles.textarea,
                  marginTop: "8px",
                }}
                placeholder="Ex: Penultima tranșă, 2 pufuri..."
                value={newTreatment.detalii}
                onChange={(e) =>
                  setNewTreatment({
                    ...newTreatment,
                    detalii: e.target.value,
                  })
                }
              />

              <button
                style={styles.addTreatmentButton}
                onClick={addTreatment}
                disabled={savingTreatment}
              >
                {savingTreatment
                  ? "Se adaugă..."
                  : "➕ Adaugă tratamentul"}
              </button>

            </div>

            {/* ISTORIC */}

            <h3 style={styles.historyTitle}>
              📜 Istoric tratamente
            </h3>

            {tratamente.length === 0 ? (

              <div style={styles.emptyHistory}>
                Nu există tratamente
                înregistrate pentru acest stup.
              </div>

            ) : (

              <div style={styles.historyList}>

                {tratamente.map(
                  (tratament) => (

                    <div
                      key={tratament.id}
                      style={styles.historyItem}
                    >

                      <div
                        style={
                          styles.historyMain
                        }
                      >

                        <strong>
                          {tratament.tip}
                        </strong>

                        <span>
                          📅{" "}
                          {tratament.data_tratament}
                        </span>

                        {tratament.detalii && (
                          <span
                            style={
                              styles.historyDetails
                            }
                          >
                            📝{" "}
                            {tratament.detalii}
                          </span>
                        )}

                      </div>

                      <button
                        style={styles.deleteButton}
                        onClick={() =>
                          deleteTreatment(
                            tratament.id
                          )
                        }
                        disabled={
                          deletingTreatment ===
                          tratament.id
                        }
                      >
                        {deletingTreatment ===
                        tratament.id
                          ? "Se șterge..."
                          : "🗑️ Șterge"}
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* OBSERVAȚII */}

          <div style={styles.card}>

            <div style={styles.cardLabel}>
              📝 Observații
            </div>

            <textarea
              style={styles.textarea}
              value={stup.observatii || ""}
              placeholder="Scrie observațiile despre stup..."
              onChange={(e) =>
                handleChange(
                  "observatii",
                  e.target.value
                )
              }
            />

          </div>

          <button
            style={styles.saveButton}
            onClick={saveChanges}
            disabled={saving}
          >
            {saving
              ? "Se salvează..."
              : "💾 Salvează modificările"}
          </button>

        </aside>

      </div>

    </main>
  );
}

function EditCard({
  label,
  value,
  type = "text",
  step,
  placeholder,
  onChange,
}) {
  return (
    <div style={styles.card}>

      <div style={styles.cardLabel}>
        {label}
      </div>

      <input
        style={styles.editInput}
        type={type}
        step={step}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

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
    gridTemplateColumns: "1fr 420px",
    gap: "30px",
    alignItems: "start",
  },

  hiveSection: {
    background: "#fff",
    borderRadius: "18px",
    padding: "35px",
    minHeight: "650px",
    boxShadow:
      "0 4px 18px rgba(0,0,0,0.08)",
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

  queenInput: {
    marginTop: "8px",
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "center",
    width: "220px",
  },

  queenYear: {
    color: "#888",
    marginTop: "10px",
    marginBottom: "5px",
  },

  yearInput: {
    width: "100px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
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
    boxShadow:
      "0 4px 18px rgba(0,0,0,0.08)",
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
    marginBottom: "7px",
  },

  editInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    fontSize: "16px",
  },

  textarea: {
    width: "100%",
    minHeight: "90px",
    boxSizing: "border-box",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    fontSize: "15px",
    resize: "vertical",
  },

  treatmentSection: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "2px solid #eee",
  },

  treatmentTitle: {
    marginTop: 0,
    marginBottom: "15px",
    fontSize: "20px",
  },

  newTreatment: {
    background: "#f7f7f7",
    padding: "15px",
    borderRadius: "10px",
  },

  addTreatmentButton: {
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#2e7d32",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  historyTitle: {
    marginTop: "25px",
    marginBottom: "12px",
    fontSize: "17px",
  },

  emptyHistory: {
    padding: "15px",
    background: "#f7f7f7",
    borderRadius: "8px",
    color: "#777",
    fontSize: "14px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    background: "#f7f7f7",
    borderRadius: "8px",
  },

  historyMain: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },

  historyDetails: {
    color: "#666",
    fontSize: "13px",
    wordBreak: "break-word",
  },

  deleteButton: {
    flexShrink: 0,
    border: "none",
    background: "#d32f2f",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  saveButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "9px",
    background: "#2e7d32",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "10px",
  },

};
