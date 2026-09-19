"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function StupinaDetaliiPage() {
  const params = useParams();
  const id = params.id;

  const [stupina, setStupina] = useState(null);
  const [stupi, setStupi] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [numarStup, setNumarStup] = useState("");
  const [observatii, setObservatii] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);

    // Luăm stupina
    const { data: stupinaData, error: stupinaError } = await supabase
      .from("stupine")
      .select("*")
      .eq("id", id)
      .single();

    if (stupinaError) {
      console.error(stupinaError);
      alert("Eroare la încărcarea stupinei: " + stupinaError.message);
      setLoading(false);
      return;
    }

    setStupina(stupinaData);

    // Luăm toți stupii din această stupină
    const { data: stupiData, error: stupiError } = await supabase
      .from("stupi")
      .select("*")
      .eq("stupina_id", id)
      .order("id", { ascending: true });

    if (stupiError) {
      console.error(stupiError);
      alert("Eroare la încărcarea stupilor: " + stupiError.message);
      setLoading(false);
      return;
    }

    setStupi(stupiData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function adaugaStup(e) {
    e.preventDefault();

    if (!numarStup.trim()) {
      alert("Introdu numărul stupului.");
      return;
    }

    setSaving(true);

    /*
      IMPORTANT:
      Presupunem că tabelul "stupi" are coloanele:
      - id
      - stupina_id
      - numar
      - observatii

      Dacă tabelul tău are alte denumiri, îmi trimiți
      structura lui și îl adaptez.
    */

    const { error } = await supabase.from("stupi").insert([
      {
        numar: numarStup.trim(),
        stupina_id: id,
        observatii: observatii.trim() || null,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Eroare la adăugarea stupului: " + error.message);
      setSaving(false);
      return;
    }

    setNumarStup("");
    setObservatii("");
    setShowForm(false);
    setSaving(false);

    await loadData();
  }

  async function stergeStup(stupId) {
    const confirmare = confirm(
      "Sigur vrei să ștergi acest stup?"
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("stupi")
      .delete()
      .eq("id", stupId);

    if (error) {
      console.error(error);
      alert("Eroare la ștergerea stupului: " + error.message);
      return;
    }

    await loadData();
  }

  if (loading) {
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
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            textAlign: "center",
          }}
        >
          Se încarcă stupina...
        </div>
      </main>
    );
  }

  if (!stupina) {
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
          <Link href="/stupine">
            ← Înapoi la stupine
          </Link>

          <h1>Stupina nu a fost găsită</h1>
        </div>
      </main>
    );
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
        {/* HEADER */}
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
              href="/stupine"
              style={{
                textDecoration: "none",
                color: "#555",
                fontSize: "14px",
              }}
            >
              ← Înapoi la stupine
            </Link>

            <h1
              style={{
                margin: "8px 0 5px",
                fontSize: "32px",
                color: "#222",
              }}
            >
              📍 {stupina.nume}
            </h1>

            {stupina.locatie && (
              <p
                style={{
                  margin: 0,
                  color: "#666",
                }}
              >
                📌 {stupina.locatie}
              </p>
            )}

            {stupina.observatii && (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#777",
                }}
              >
                📝 {stupina.observatii}
              </p>
            )}
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
            ➕ Adaugă stup
          </button>
        </div>

        {/* FORMULAR ADAUGARE STUP */}
        {showForm && (
          <form
            onSubmit={adaugaStup}
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "25px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#222",
              }}
            >
              ➕ Adaugă stup în {stupina.nume}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
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
                  Număr stup *
                </label>

                <input
                  value={numarStup}
                  onChange={(e) => setNumarStup(e.target.value)}
                  placeholder="Ex: 101"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontSize: "15px",
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
                  placeholder="Ex: Familie puternică"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontSize: "15px",
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
                {saving ? "Se salvează..." : "Salvează stupul"}
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

        {/* STATISTICĂ */}
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "5px",
            }}
          >
            Total stupi în această stupină
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#222",
            }}
          >
            🐝 {stupi.length}
          </div>
        </div>

        {/* LISTA STUPILOR */}
        {stupi.length === 0 ? (
          <div
            style={{
              background: "white",
              padding: "45px 25px",
              borderRadius: "14px",
              textAlign: "center",
              color: "#666",
            }}
          >
            <div
              style={{
                fontSize: "50px",
                marginBottom: "10px",
              }}
            >
              🐝
            </div>

            <h2
              style={{
                color: "#333",
                marginBottom: "8px",
              }}
            >
              Nu ai încă stupi în această stupină
            </h2>

            <p>
              Apasă pe „Adaugă stup” pentru a introduce primul stup.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #eee",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#222",
                }}
              >
                🐝 Stupii din {stupina.nume}
              </h2>
            </div>

            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "600px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                    }}
                  >
                    <th
                      style={{
                        padding: "14px",
                        textAlign: "left",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      #
                    </th>

                    <th
                      style={{
                        padding: "14px",
                        textAlign: "left",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      Stup
                    </th>

                    <th
                      style={{
                        padding: "14px",
                        textAlign: "left",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      Observații
                    </th>

                    <th
                      style={{
                        padding: "14px",
                        textAlign: "right",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      Acțiuni
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stupi.map((stup, index) => (
                    <tr key={stup.id}>
                      <td
                        style={{
                          padding: "14px",
                          borderBottom: "1px solid #eee",
                          color: "#777",
                        }}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom: "1px solid #eee",
                          fontWeight: "700",
                          color: "#222",
                        }}
                      >
                        🐝 Stupul {stup.numar}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom: "1px solid #eee",
                          color: "#666",
                        }}
                      >
                        {stup.observatii || "—"}
                      </td>

                      <td
                        style={{
                          padding: "14px",
                          borderBottom: "1px solid #eee",
                          textAlign: "right",
                        }}
                      >
                        <button
                          onClick={() => stergeStup(stup.id)}
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Șterge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
