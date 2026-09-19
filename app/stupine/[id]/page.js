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

  async function incarcaDate() {
    setLoading(true);

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

    setStupina(stupinaData);
    setStupi(stupiData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      incarcaDate();
    }
  }, [id]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f4f6f8",
          padding: "30px",
          textAlign: "center",
        }}
      >
        Se încarcă...
      </main>
    );
  }

  if (!stupina) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f4f6f8",
          padding: "30px",
        }}
      >
        <h1>Stupina nu a fost găsită.</h1>

        <Link href="/stupine">
          ← Înapoi la stupine
        </Link>
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
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
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

        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "25px",
            marginTop: "18px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#222",
                  fontSize: "32px",
                }}
              >
                📍 {stupina.nume}
              </h1>

              {stupina.locatie && (
                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#666",
                    fontSize: "16px",
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

            <div
              style={{
                background: "#f59e0b",
                color: "white",
                borderRadius: "12px",
                padding: "15px 22px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                {stupi.length}
              </div>

              <div>
                {stupi.length === 1 ? "familie" : "familii"}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "18px",
              color: "#222",
            }}
          >
            🐝 Familiile din această stupină
          </h2>

          {stupi.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#666",
              }}
            >
              <div
                style={{
                  fontSize: "45px",
                  marginBottom: "10px",
                }}
              >
                🐝
              </div>

              <h3 style={{ color: "#333" }}>
                Nu există încă familii în această stupină.
              </h3>

              <p>
                Familiile vor apărea aici după ce le atribui acestei stupine.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f3f4f6",
                    }}
                  >
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Număr stup</th>
                    <th style={thStyle}>Tip</th>
                    <th style={thStyle}>Matcă</th>
                    <th style={thStyle}>Observații</th>
                  </tr>
                </thead>

                <tbody>
                  {stupi.map((stup) => (
                    <tr key={stup.id}>
                      <td style={tdStyle}>{stup.id}</td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "700",
                        }}
                      >
                        {stup.numar || "-"}
                      </td>

                      <td style={tdStyle}>
                        {stup.tip || "-"}
                      </td>

                      <td style={tdStyle}>
                        {stup.matca || "-"}
                      </td>

                      <td style={tdStyle}>
                        {stup.observatii || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "13px",
  borderBottom: "2px solid #ddd",
  color: "#333",
  fontSize: "14px",
};

const tdStyle = {
  padding: "13px",
  borderBottom: "1px solid #eee",
  color: "#555",
  fontSize: "14px",
};
