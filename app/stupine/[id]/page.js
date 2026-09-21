"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

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

  const [verification, setVerification] = useState({
    data_verificare: new Date().toISOString().split("T")[0],
    matca: "",
    are_matca: true,
    an_matca: "",
    rame: "",
    rame_puiet: "",
    rame_miere: "",
    rame_polen: "",
    observatii: "",
  });

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

    if (!stupiError) {
      setStupi(stupiData || []);
    }

    const { data: roiuriData, error: roiuriError } = await supabase
      .from("roiuri")
      .select("*")
      .eq("stupina_id", id)
      .order("numar");

    if (!roiuriError) {
      setRoiuri(roiuriData || []);
    }

    const { data: allStupi } = await supabase
      .from("stupi")
      .select("*")
      .order("numar_stup");
    if (allStupi) setAvailableStupi(allStupi);

    const { data: allRoiuri } = await supabase
      .from("roiuri")
      .select("*")
      .order("numar");
    if (allRoiuri) setAvailableRoiuri(allRoiuri);

    setLoading(false);
  }

  function openVerification(familie) {
    setSelectedFamilie(familie);
    setVerification({
      data_verificare: new Date().toISOString().split("T")[0],
      matca: familie.matca || "",
      are_matca: familie.are_matca !== undefined ? familie.are_matca : familie.matca === "Da",
      an_matca: familie.an_matca || "",
      rame: familie.rame || "",
      rame_puiet: familie.rame_puiet || "",
      rame_miere: familie.rame_miere || "",
      rame_polen: familie.rame_polen || "",
      observatii: familie.observatii || "",
    });
    setShowVerification(true);
  }

  async function saveVerification() {
    if (!selectedFamilie) return;
    setSaving(true);
    const esteStup = selectedFamilie.tipFamilie === "Stup";

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
      [esteStup ? "stup_id" : "roi_id"]: selectedFamilie.id,
    };

    const { error: verificationError } = await supabase
      .from("verificari")
      .insert([verificationData]);

    if (verificationError) {
      alert("Eroare la salvarea verificării: " + verificationError.message);
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
    await supabase.from(tabel).update(updateData).eq("id", selectedFamilie.id);

    alert("Verificarea a fost salvată!");
    setShowVerification(false);
    setSelectedFamilie(null);
    setSaving(false);
    getData();
  }

  async function addExistingStup(stup) {
    if (!window.confirm(`Adaugi stupul nr. ${stup.numar_stup} în stupină?`)) return;
    await supabase.from("stupi").update({ stupina_id: id }).eq("id", stup.id);
    setShowAddStup(false);
    getData();
  }

  async function addExistingRoi(roi) {
    if (!window.confirm(`Adaugi ${roi.tip || "Roi"} nr. ${roi.numar} în stupină?`)) return;
    await supabase.from("roiuri").update({ stupina_id: id }).eq("id", roi.id);
    setShowAddRoi(false);
    getData();
  }

  async function addBulkToStupina() {
    const totalSelectate = selectedStupi.length + selectedRoiuri.length;
    if (totalSelectate === 0) {
      alert("Selectează cel puțin un element.");
      return;
    }
    setSaving(true);
    if (selectedStupi.length > 0) {
      await supabase.from("stupi").update({ stupina_id: id }).in("id", selectedStupi);
    }
    if (selectedRoiuri.length > 0) {
      await supabase.from("roiuri").update({ stupina_id: id }).in("id", selectedRoiuri);
    }
    setSelectedStupi([]);
    setSelectedRoiuri([]);
    setShowBulkAdd(false);
    setSaving(false);
    getData();
  }

  async function removeStup(stup) {
    if (!window.confirm(`Scoți stupul nr. ${stup.numar_stup} din stupină?`)) return;
    await supabase.from("stupi").update({ stupina_id: null }).eq("id", stup.id);
    getData();
  }

  async function removeRoi(roi) {
    if (!window.confirm(`Scoți roiul nr. ${roi.numar} din stupină?`)) return;
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

  const filteredFamilii = familiiTabel.filter((f) =>
    String(f.numar || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalFamilii = familiiTabel.length;
  const totalMiere = familiiTabel.reduce((sum, f) => sum + Number(f.miere_kg || 0), 0);
  const cuMatca = familiiTabel.filter((f) => f.are_matca === true || f.matca === "Da").length;
  const faraMatca = totalFamilii - cuMatca;

  if (loading) return <main style={styles.page}>Se încarcă...</main>;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <Link href="/stupine" style={styles.back}>← Înapoi la stupine</Link>
        <h1 style={styles.title}>🐝 {stupina?.nume}</h1>

        <div style={styles.headerButtons}>
          <button onClick={() => setShowBulkAdd(true)} style={styles.bulkButton}>📦 Adaugă în masă</button>
          <button onClick={() => setShowAddStup(true)} style={styles.primaryButton}>➕ Adaugă stup existent</button>
          <button onClick={() => setShowAddRoi(true)} style={styles.secondaryButton}>🐝 Adaugă roi existent</button>
        </div>

        {/* TABEL FAMILII */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Tip</th>
                <th>Nr.</th>
                <th>Matcă</th>
                <th>Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {filteredFamilii.map((familie) => {
                const esteStup = familie.tipFamilie === "Stup";
                return (
                  <tr key={`${familie.tipFamilie}-${familie.id}`}>
                    <td>{familie.tipFamilie}</td>
                    <td>#{familie.numar}</td>
                    <td>{familie.are_matca ? "✅ Da" : "❌ Nu"}</td>
                    <td>
                      <button onClick={() => openVerification(familie)} style={styles.verifyButton}>
                        📝 Verifică
                      </button>
                      <button onClick={() => (esteStup ? removeStup(familie.original) : removeRoi(familie.original))} style={styles.removeButton}>
                        Scoate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MODAL VERIFICARE UNIFICAT */}
        {showVerification && selectedFamilie && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2>📝 Verificare {selectedFamilie.tipFamilie} #{selectedFamilie.numar}</h2>
              <div style={styles.formGrid}>
                <label>Data: <input type="date" value={verification.data_verificare} onChange={(e) => setVerification({ ...verification, data_verificare: e.target.value })} style={styles.input} /></label>
                <label>Rasa matcă: <input value={verification.matca} onChange={(e) => setVerification({ ...verification, matca: e.target.value })} style={styles.input} /></label>
                <label>Are matcă?: 
                  <select value={verification.are_matca ? "Da" : "Nu"} onChange={(e) => setVerification({ ...verification, are_matca: e.target.value === "Da" })} style={styles.input}>
                    <option value="Da">Da</option>
                    <option value="Nu">Nu</option>
                  </select>
                </label>
                <label>Rame puiet: <input type="number" value={verification.rame_puiet} onChange={(e) => setVerification({ ...verification, rame_puiet: e.target.value })} style={styles.input} /></label>
              </div>
              <button onClick={saveVerification} disabled={saving} style={styles.saveButton}>{saving ? "Se salvează..." : "💾 Salvează"}</button>
              <button onClick={() => setShowVerification(false)} style={styles.closeBtn}>Închide</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f5f7f6", padding: "30px 20px", fontFamily: "Arial" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  title: { fontSize: "30px", marginBottom: "20px" },
  back: { color: "#167a42", textDecoration: "none", fontWeight: "bold" },
  headerButtons: { display: "flex", gap: "10px", margin: "20px 0" },
  primaryButton: { background: "#167a42", color: "white", padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer" },
  secondaryButton: { background: "#e8a928", padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer" },
  bulkButton: { background: "#2563eb", color: "white", padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer" },
  card: { background: "white", borderRadius: "8px", overflow: "hidden", marginTop: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  verifyButton: { background: "#167a42", color: "white", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px" },
  removeButton: { background: "#ccc", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "white", padding: "20px", borderRadius: "10px", width: "500px", maxWidth: "90%" },
  formGrid: { display: "grid", gap: "10px", margin: "15px 0" },
  input: { width: "100%", padding: "8px", marginTop: "5px", boxSizing: "border-box" },
  saveButton: { width: "100%", background: "#167a42", color: "white", padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "10px" },
  closeBtn: { width: "100%", background: "#eee", padding: "8px", border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "5px" }
};
