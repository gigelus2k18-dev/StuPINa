"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function StupinePage() {
  const [stupine, setStupine] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [nume, setNume] = useState("");
  const [locatie, setLocatie] = useState("");
  const [observatii, setObservatii] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadStupine() {
    setLoading(true);

    const { data, error } = await supabase
      .from("stupine")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      alert("Eroare la încărcarea stupinelor: " + error.message);
      setLoading(false);
      return;
    }

    const { data: stupiData, error: stupiError } = await supabase
      .from("stupi")
      .select("id, stupina_id");

    if (stupiError) {
      console.error(stupiError);
    }

    const result = (data || []).map((stupina) => ({
      ...stupina,
      familii: (stupiData || []).filter(
        (stup) => stup.stupina_id === stupina.id
      ).length,
    }));

    setStupine(result);
    setLoading(false);
  }

  useEffect(() => {
    loadStupine();
  }, []);

  async function adaugaStupina(e) {
    e.preventDefault();

    if (!nume.trim()) {
      alert("Introdu numele stupinei.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("stupine").insert([
      {
        nume: nume.trim(),
        locatie: locatie.trim() || null,
        observatii: observatii.trim() || null,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Eroare la adăugarea stupinei: " + error.message);
      setSaving(false);
      return;
    }

    setNume("");
    setLocatie("");
    setObservatii("");
    setShowForm(false);
    setSaving(false);

    await loadStupine();
  }

  async function stergeStupina(id) {
    const confirmare = confirm(
      "Sigur vrei să ștergi această stupină?\n\nFamiliile nu vor fi șterse. Ele vor rămâne fără stupină."
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("stupine")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Eroare la ștergere: " + error.message);
      return;
    }

    await loadStupine();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#555",
                fontSize: "14px",
              }}
            >
              ← Înapoi la familii
            </Link>

            <h1
              style={{
                margin: "8px 0 0",
                fontSize: "32px",
                color: "#222",
              }}
            >
              📍 Stupine
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#666",
              }}
            >
              Organizează familiile pe stupine și locații.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px 18px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ➕ Adaugă stupină
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={adaugaStupina}
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "25px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>➕ Adaugă stupină</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Nume stupină *
                </label>

                <input
                  value={nume}
                  onChange={(e) => setNume(e.target.value)}
                  placeholder="Ex: Stupina Vițomirești"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Locație
                </label>

                <input
                  value={locatie}
                  onChange={(e) => setLocatie(e.target.value)}
                  placeholder="Ex: Vițomirești, Vâlcea"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Observații
                </label>

                <input
                  value={observatii}
                  onChange={(e) => setObservatii(e.target.value)}
                  placeholder="Observații despre stupină"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "11px 18px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {saving ? "Se salvează..." : "Salvează stupina"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "#e5e7eb",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  padding: "11px 18px",
                  cursor: "pointer",
                }}
              >
                Anulează
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            Se încarcă stupinele...
          </div>
        ) : stupine.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "14px",
              textAlign: "center",
              color: "#666",
            }}
          >
            <div style={{ fontSize: "45px", marginBottom: "10px" }}>
              📍
            </div>

            <h2 style={{ color: "#333" }}>
              Nu ai încă nicio stupină
            </h2>

            <p>
              Creează prima stupină pentru a începe să-ți organizezi
              familiile.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {stupine.map((stupina) => (
              <div
                key={stupina.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "38px",
                    marginBottom: "8px",
                  }}
                >
                  📍
                </div>

                <h2
                  style={{
                    margin: "0 0 8px",
                    color: "#222",
                  }}
                >
                  {stupina.nume}
                </h2>

                {stupina.locatie && (
                  <p
                    style={{
                      margin: "5px 0",
                      color: "#666",
                    }}
                  >
                    📌 {stupina.locatie}
                  </p>
                )}

                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    padding: "12px",
                    marginTop: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <strong>{stupina.familii}</strong>{" "}
                  {stupina.familii === 1
                    ? "familie"
                    : "familii"}
                </div>

                {stupina.observatii && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    📝 {stupina.observatii}
                  </p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "18px",
                  }}
                >
                  <Link
                    href={`/stupine/${stupina.id}`}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      background: "#f59e0b",
                      color: "white",
                      padding: "10px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    Deschide
                  </Link>

                  <button
                    onClick={() => stergeStupina(stupina.id)}
                    style={{
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      padding: "10px 13px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    title="Șterge stupina"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
