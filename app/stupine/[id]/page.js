"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import VerificareModal from "@/VerificareModal";

export default function StupinaPage() {
  const params = useParams();
  const id = params.id;

  const [stupina, setStupina] = useState(null);
  const [stupi, setStupi] = useState([]);
  const [roiuri, setRoiuri] = useState([]);

  const [availableStupi, setAvailableStupi] = useState([]);
  const [availableRoiuri, setAvailableRoiuri] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAddStup, setShowAddStup] = useState(false);
  const [showAddRoi, setShowAddRoi] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const [selectedStupi, setSelectedStupi] = useState([]);
  const [selectedRoiuri, setSelectedRoiuri] = useState([]);

  const [selectedFamilie, setSelectedFamilie] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  async function getData() {
    setLoading(true);

    const { data: stupinaData, error: stupinaError } = await supabase
      .from("stupine")
      .select("*")
      .eq("id", id)
      .single();

    if (stupinaError) {
      console.error("EROARE STUPINA:", stupinaError);
      alert("Nu am putut încărca stupina.");
      setLoading(false);
      return;
    }

    setStupina(stupinaData);

    const { data: stupiData, error: stupiError } = await supabase
      .from("stupi")
      .select("*")
      .eq("stupina_id", id)
      .order("numar_stup");

    if (stupiError) {
      console.error("EROARE STUPI:", stupiError);
      alert("Eroare la încărcarea stupilor.");
    } else {
      setStupi(stupiData || []);
    }

    const { data: roiuriData, error: roiuriError } = await supabase
      .from("roiuri")
      .select("*")
      .eq("stupina_id", id)
      .order("numar");

    if (roiuriError) {
      console.error("EROARE ROIURI:", roiuriError);
      setRoiuri([]);
    } else {
      setRoiuri(roiuriData || []);
    }

    const { data: allStupi, error: allStupiError } = await supabase
      .from("stupi")
      .select("*")
      .order("numar_stup");

    if (!allStupiError) {
      setAvailableStupi(allStupi || []);
    }

    const { data: allRoiuri, error: allRoiuriError } = await supabase
      .from("roiuri")
      .select("*")
      .order("numar");

    if (!allRoiuriError) {
      setAvailableRoiuri(allRoiuri || []);
    }

    setLoading(false);
  }

  function openVerification(familie) {
    setSelectedFamilie(familie);
    setShowVerification(true);
  }

  async function addExistingStup(stup) {
    const confirmare = window.confirm(
      `Adaugi stupul nr. ${stup.numar_stup} în stupina "${stupina?.nume}"?`
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("stupi")
      .update({ stupina_id: id })
      .eq("id", stup.id);

    if (error) {
      alert("Nu am putut adăuga stupul:\n\n" + error.message);
      return;
    }

    setShowAddStup(false);
    getData();
  }

  async function addExistingRoi(roi) {
    const confirmare = window.confirm(
      `Adaugi ${roi.tip || "Roi"} nr. ${roi.numar} în stupina "${stupina?.nume}"?`
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("roiuri")
      .update({ stupina_id: id })
      .eq("id", roi.id);

    if (error) {
      alert("Nu am putut adăuga roiul:\n\n" + error.message);
      return;
    }

    setShowAddRoi(false);
    getData();
  }

  async function addBulkToStupina() {
    const totalSelectate = selectedStupi.length + selectedRoiuri.length;

    if (totalSelectate === 0) {
      alert("Selectează cel puțin un stup, roi sau nucleu.");
      return;
    }

    const confirmare = window.confirm(
      `Vrei să adaugi ${totalSelectate} elemente în stupina "${stupina?.nume}"?`
    );

    if (!confirmare) return;
    setSaving(true);

    if (selectedStupi.length > 0) {
      await supabase
        .from("stupi")
        .update({ stupina_id: id })
        .in("id", selectedStupi);
    }

    if (selectedRoiuri.length > 0) {
      await supabase
        .from("roiuri")
        .update({ stupina_id: id })
        .in("id", selectedRoiuri);
    }

    setSelectedStupi([]);
    setSelectedRoiuri([]);
    setShowBulkAdd(false);
    setSaving(false);
    getData();
  }

  function toggleStupSelection(stupId) {
    setSelectedStupi((prev) =>
      prev.includes(stupId) ? prev.filter((i) => i !== stupId) : [...prev, stupId]
    );
  }

  function toggleRoiSelection(roiId) {
    setSelectedRoiuri((prev) =>
      prev.includes(roiId) ? prev.filter((i) => i !== roiId) : [...prev, roiId]
    );
  }

  function selectAllStupi() {
    if (selectedStupi.length === stupiDisponibili.length) {
      setSelectedStupi([]);
    } else {
      setSelectedStupi(stupiDisponibili.map((s) => s.id));
    }
  }

  function selectAllRoiuri() {
    if (selectedRoiuri.length === roiuriDisponibili.length) {
      setSelectedRoiuri([]);
    } else {
      setSelectedRoiuri(roiuriDisponibile.map((r) => r.id));
    }
  }

  async function removeStup(stup) {
    if (!window.confirm(`Scoți stupul nr. ${stup.numar_stup} din stupină?`)) return;
    await supabase.from("stupi").update({ stupina_id: null }).eq("id", stup.id);
    getData();
  }

  async function removeRoi(roi) {
    if (!window.confirm(`Scoți ${roi.tip || "Roi"} nr. ${roi.numar} din stupină?`)) return;
    await supabase.from("roiuri").update({ stupina_id: null }).eq("id", roi.id);
    getData();
  }

  async function updateStupStatus(stupId, status) {
    await supabase.from("stupi").update({ status }).eq("id", stupId);
    setStupi((prev) => prev.map((s) => (s.id === stupId ? { ...s, status } : s)));
  }

  async function updateRoiStatus(roiId, status) {
    await supabase.from("roiuri").update({ status }).eq("id", roiId);
    setRoiuri((prev) => prev.map((r) => (r.id === roiId ? { ...r, status } : r)));
  }

  const familiiTabel = [
    ...stupi.map((stup) => ({
      tipFamilie: "Stup",
      id: stup.id,
      numar: stup.numar_stup,
      matca: stup.matca,
      are_matca: stup.are_matca,
      an_matca: stup.an_matca,
      rame: stup.rame,
      rame_puiet: stup.rame_puiet,
      rame_miere: stup.rame_miere,
      rame_polen: stup.rame_polen,
      miere_kg: stup.miere_kg,
      status: stup.status,
      observatii: stup.observatii,
      original: stup,
    })),
    ...roiuri.map((roi) => ({
      tipFamilie: roi.tip === "Nucleu" ? "Nucleu" : "Roi",
      id: roi.id,
      numar: roi.numar,
      matca: roi.matca,
      are_matca: roi.are_matca,
      an_matca: roi.an_matca,
      rame: roi.rame,
      rame_puiet: roi.rame_puiet,
      rame_miere: roi.rame_miere,
      rame_polen: roi.rame_polen,
      miere_kg: roi.miere_kg,
      status: roi.status,
      observatii: roi.observatii,
      origine: roi.origine,
      original: roi,
    })),
  ];

  const filteredFamilii = familiiTabel.filter((familie) =>
    String(familie.numar || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalFamilii = familiiTabel.length;
  const totalMiere = familiiTabel.reduce((sum, f) => sum + Number(f.miere_kg || 0), 0);
  const totalPuiet = familiiTabel.reduce((sum, f) => sum + Number(f.rame_puiet || 0), 0);
  const totalMiereRame = familiiTabel.reduce((sum, f) => sum + Number(f.rame_miere || 0), 0);
  const totalPolen = familiiTabel.reduce((sum, f) => sum + Number(f.rame_polen || 0), 0);

  const cuMatca = familiiTabel.filter(
    (f) => f.are_matca === true || f.matca === "Da"
  ).length;
  const faraMatca = totalFamilii - cuMatca;
  const active = familiiTabel.filter((f) => f.status === "Activ").length;

  const stupiDisponibili = availableStupi.filter(
    (s) => String(s.stupina_id || "") !== String(id)
  );
  const roiuriDisponibile = availableRoiuri.filter(
    (r) => String(r.stupina_id || "") !== String(id)
  );

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>Se încarcă stupina...</div>
      </main>
    );
  }

  if (!stupina) {
    return (
      <main style={styles.page}>
        <h1>Stupina nu a fost găsită.</h1>
        <Link href="/stupine">← Înapoi la stupine</Link>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/stupine" style={styles.back}>
          ← Înapoi la stupine
        </Link>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🐝 {stupina.nume}</h1>
            <div style={styles.location}>
              📍 {stupina.locatie || "Locație nespecificată"}
            </div>
            {stupina.observatii && <div style={styles.notes}>{stupina.observatii}</div>}
          </div>

          <div style={styles.headerButtons}>
            <button onClick={() => setShowBulkAdd(true)} style={styles.bulkButton}>
              📦 Adaugă în masă
            </button>
            <button onClick={() => setShowAddStup(true)} style={styles.primaryButton}>
              ➕ Adaugă stup existent
            </button>
            <button onClick={() => setShowAddRoi(true)} style={styles.secondaryButton}>
              🐝 Adaugă roi existent
            </button>
          </div>
        </div>

        <div style={styles.stats}>
          <div style={styles.stat}>
            <strong>{totalFamilii}</strong>
            <span>Familii</span>
          </div>
          <div style={styles.stat}>
            <strong>{stupi.length}</strong>
            <span>Stupi</span>
          </div>
          <div style={styles.stat}>
            <strong>{roiuri.length}</strong>
            <span>Roiuri/Nuclee</span>
          </div>
          <div style={styles.stat}>
            <strong>{cuMatca}</strong>
            <span>Cu matcă</span>
          </div>
          <div style={styles.stat}>
            <strong>{faraMatca}</strong>
            <span>Fără matcă</span>
          </div>
          <div style={styles.stat}>
            <strong>{totalMiere.toFixed(1)}</strong>
            <span>Kg miere</span>
          </div>
          <div style={styles.stat}>
            <strong>{totalPuiet}</strong>
            <span>Rame puiet</span>
          </div>
          <div style={styles.stat}>
            <strong>{active}</strong>
            <span>Active</span>
          </div>
        </div>

        {faraMatca > 0 && (
          <div style={styles.alert}>
            ⚠️ Atenție: {faraMatca} familie/familii fără matcă.
          </div>
        )}

        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="🔎 Caută după număr..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
          <div style={styles.smallStats}>
            🍯 {totalMiereRame} rame miere · 🌼 {totalPolen} rame polen
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2>Familiile din {stupina.nume}</h2>
            <span>{filteredFamilii.length} rezultate</span>
          </div>

          {filteredFamilii.length === 0 ? (
            <div style={styles.empty}>
              Nu există încă familii în această stupină.
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Tip</th>
                    <th>Nr.</th>
                    <th>Rasa matcă</th>
                    <th>Are matcă?</th>
                    <th>An matcă</th>
                    <th>Rame</th>
                    <th>Puiet</th>
                    <th>Miere kg</th>
                    <th>Polen</th>
                    <th>Status</th>
                    <th>Origine</th>
                    <th>Observații</th>
                    <th>Acțiune</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilii.map((familie) => {
                    const esteStup = familie.tipFamilie === "Stup";
                    return (
                      <tr key={`${familie.tipFamilie}-${familie.id}`}>
                        <td>
                          <span
                            style={{
                              ...styles.badge,
                              background: esteStup ? "#e8f5e9" : "#fff3cd",
                            }}
                          >
                            {familie.tipFamilie}
                          </span>
                        </td>
                        <td>
                          {esteStup ? (
                            <Link href={`/stupi/${familie.numar}`} style={styles.numberLink}>
                              #{familie.numar}
                            </Link>
                          ) : (
                            <strong>#{familie.numar}</strong>
                          )}
                        </td>
                        <td>{familie.matca || "-"}</td>
                        <td>
                          {familie.are_matca === true || familie.matca === "Da"
                            ? "✅ Da"
                            : "❌ Nu"}
                        </td>
                        <td>{familie.an_matca || "-"}</td>
                        <td>{familie.rame ?? 0}</td>
                        <td>{familie.rame_puiet ?? 0}</td>
                        <td>{Number(familie.miere_kg || 0).toFixed(1)}</td>
                        <td>{familie.rame_polen ?? 0}</td>
                        <td>
                          <select
                            value={familie.status || ""}
                            onChange={(e) => {
                              if (esteStup) {
                                updateStupStatus(familie.id, e.target.value);
                              } else {
                                updateRoiStatus(familie.id, e.target.value);
                              }
                            }}
                            style={styles.select}
                          >
                            <option value="">-</option>
                            <option value="Activ">Activ</option>
                            <option value="Inactiv">Inactiv</option>
                            {!esteStup && (
                              <>
                                <option value="Vândut">Vândut</option>
                                <option value="Unit">Unit</option>
                                <option value="Pierdut">Pierdut</option>
                              </>
                            )}
                          </select>
                        </td>
                        <td>{familie.origine || "-"}</td>
                        <td style={styles.observatii}>{familie.observatii || "-"}</td>
                        <td>
                          <div style={styles.actions}>
                            <button
                              onClick={() => openVerification(familie)}
                              style={styles.verifyButton}
                            >
                              📝 Verifică
                            </button>
                            <button
                              onClick={() =>
                                esteStup
                                  ? removeStup(familie.original)
                                  : removeRoi(familie.original)
                              }
                              style={styles.removeButton}
                            >
                              Scoate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL VERIFICARE UNIFICAT */}
        {showVerification && selectedFamilie && (
          <VerificareModal
            familia={selectedFamilie}
            onClose={() => {
              setShowVerification(false);
              setSelectedFamilie(null);
            }}
            onSaved={() => {
              setShowVerification(false);
              setSelectedFamilie(null);
              getData();
            }}
          />
        )}

        {/* MODAL ADAUGĂ ÎN MASĂ */}
        {showBulkAdd && (
          <div style={styles.modalOverlay}>
            <div style={styles.bulkModal}>
              <div style={styles.modalHeader}>
                <h2>📦 Adaugă în masă</h2>
                <button
                  onClick={() => setShowBulkAdd(false)}
                  style={styles.close}
                >
                  ✕
                </button>
              </div>
              <button onClick={addBulkToStupina} style={styles.bulkSaveButton}>
                Salvează selecția
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f7f6", padding: "30px 20px", fontFamily: "Arial, sans-serif" },
  container: { maxWidth: "1600px", margin: "0 auto" },
  loading: { textAlign: "center", padding: "80px", fontSize: "20px" },
  back: { display: "inline-block", marginBottom: "20px", color: "#167a42", textDecoration: "none", fontWeight: "bold" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "25px", flexWrap: "wrap" },
  title: { fontSize: "34px", margin: 0 },
  location: { marginTop: "8px", color: "#555", fontSize: "17px" },
  notes: { marginTop: "8px", color: "#777" },
  headerButtons: { display: "flex", gap: "10px", flexWrap: "wrap" },
  primaryButton: { border: "none", background: "#167a42", color: "white", padding: "12px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  secondaryButton: { border: "none", background: "#e8a928", color: "#111", padding: "12px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  bulkButton: { border: "none", background: "#2563eb", color: "white", padding: "12px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" },
  stat: { background: "white", padding: "18px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" },
  alert: { background: "#fff3cd", border: "1px solid #ffe69c", padding: "14px", borderRadius: "8px", marginBottom: "20px" },
  toolbar: { display: "flex", justifyContent: "space-between", gap: "15px", marginBottom: "15px", flexWrap: "wrap" },
  search: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px", width: "300px", maxWidth: "100%" },
  smallStats: { padding: "12px", background: "white", borderRadius: "8px" },
  card: { background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" },
  cardHeader: { padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  badge: { padding: "5px 8px", borderRadius: "6px", fontWeight: "bold" },
  numberLink: { color: "#167a42", fontWeight: "bold", textDecoration: "none" },
  select: { padding: "6px", borderRadius: "6px", border: "1px solid #ccc" },
  observatii: { maxWidth: "220px" },
  actions: { display: "flex", gap: "6px", flexWrap: "wrap" },
  verifyButton: { background: "#167a42", color: "white", border: "none", padding: "7px 10px", borderRadius: "6px", cursor: "pointer" },
  removeButton: { background: "#f3f3f3", border: "1px solid #ccc", padding: "7px 10px", borderRadius: "6px", cursor: "pointer" },
  empty: { padding: "40px", textAlign: "center", color: "#666" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 1000 },
  bulkModal: { background: "white", width: "100%", maxWidth: "900px", maxHeight: "90vh", overflowY: "auto", borderRadius: "14px", padding: "25px" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  close: { border: "none", background: "transparent", fontSize: "22px", cursor: "pointer" },
  bulkSaveButton: { border: "none", background: "#167a42", color: "white", padding: "13px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", width: "100%", marginTop: "20px" }
};
