"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function StupinaPage() {
  const params = useParams();
  const router = useRouter();
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
  const [showVerification, setShowVerification] = useState(false);

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

  async function getData() {
    setLoading(true);

    const { data: stupinaData, error: stupinaError } = await supabase
      .from("stupine")
      .select("*")
      .eq("id", id)
      .single();

    if (stupinaError) {
      console.error(stupinaError);
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
      console.error(stupiError);
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
      console.error(roiuriError);
      alert("Eroare la încărcarea roiurilor.");
    } else {
      setRoiuri(roiuriData || []);
    }

    const { data: allStupi } = await supabase
      .from("stupi")
      .select("*")
      .order("numar_stup");

    setAvailableStupi(allStupi || []);

    const { data: allRoiuri } = await supabase
      .from("roiuri")
      .select("*")
      .order("numar");

    setAvailableRoiuri(allRoiuri || []);

    setLoading(false);
  }

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  function openVerification(familie) {
    setSelectedFamilie(familie);

    setVerification({
      data_verificare: new Date().toISOString().split("T")[0],
      matca: familie.matca || "",
      are_matca:
        familie.are_matca !== undefined
          ? familie.are_matca
          : familie.matca === "Da",
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

    const isStup = selectedFamilie.tipFamilie === "Stup";

    const verificationData = {
      data_verificare: verification.data_verificare,
      matca: verification.matca,
      are_matca: verification.are_matca,
      an_matca: verification.an_matca
        ? Number(verification.an_matca)
        : null,
      rame: verification.rame ? Number(verification.rame) : 0,
      rame_puiet: verification.rame_puiet
        ? Number(verification.rame_puiet)
        : 0,
      rame_miere: verification.rame_miere
        ? Number(verification.rame_miere)
        : 0,
      rame_polen: verification.rame_polen
        ? Number(verification.rame_polen)
        : 0,
      observatii: verification.observatii || null,
    };

    if (isStup) {
      verificationData.stup_id = selectedFamilie.id;
    } else {
      verificationData.roi_id = selectedFamilie.id;
    }

    const { error: verificationError } = await supabase
      .from("verificari")
      .insert([verificationData]);

    if (verificationError) {
      console.error(verificationError);
      alert("Eroare la salvarea verificării.");
      setSaving(false);
      return;
    }

    const updateData = {
      matca: verification.matca,
      are_matca: verification.are_matca,
      an_matca: verification.an_matca
        ? Number(verification.an_matca)
        : null,
      rame: verification.rame ? Number(verification.rame) : 0,
      rame_puiet: verification.rame_puiet
        ? Number(verification.rame_puiet)
        : 0,
      rame_miere: verification.rame_miere
        ? Number(verification.rame_miere)
        : 0,
      rame_polen: verification.rame_polen
        ? Number(verification.rame_polen)
        : 0,
      observatii: verification.observatii || null,
    };

    const table = isStup ? "stupi" : "roiuri";

    const { error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", selectedFamilie.id);

    if (updateError) {
      console.error(updateError);
      alert("Verificarea s-a salvat, dar familia nu a putut fi actualizată.");
    } else {
      alert("Verificarea a fost salvată!");
    }

    setShowVerification(false);
    setSelectedFamilie(null);
    setSaving(false);

    getData();
  }

  async function addExistingStup(stup) {
    const confirmare = window.confirm(
      `Adaugi stupul nr. ${stup.numar_stup} în stupina "${stupina?.nume}"?`
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("stupi")
      .update({
        stupina_id: id,
      })
      .eq("id", stup.id);

    if (error) {
      console.error(error);
      alert("Nu am putut adăuga stupul.");
      return;
    }

    alert(`Stupul nr. ${stup.numar_stup} a fost adăugat în stupină.`);
    getData();
  }

  async function removeStup(stup) {
    const confirmare = window.confirm(
      `Scoți stupul nr. ${stup.numar_stup} din această stupină?`
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("stupi")
      .update({
        stupina_id: null,
      })
      .eq("id", stup.id);

    if (error) {
      console.error(error);
      alert("Nu am putut scoate stupul din stupină.");
      return;
    }

    getData();
  }

  async function addExistingRoi(roi) {
    const confirmare = window.confirm(
      `Adaugi ${roi.tip || "roi"} nr. ${roi.numar} în stupina "${stupina?.nume}"?`
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("roiuri")
      .update({
        stupina_id: id,
      })
      .eq("id", roi.id);

    if (error) {
      console.error(error);
      alert("Nu am putut adăuga roiul.");
      return;
    }

    alert("Roiul a fost adăugat în stupină.");
    getData();
  }

  async function removeRoi(roi) {
    const confirmare = window.confirm(
      `Scoți ${roi.tip || "roi"} nr. ${roi.numar} din această stupină?`
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("roiuri")
      .update({
        stupina_id: null,
      })
      .eq("id", roi.id);

    if (error) {
      console.error(error);
      alert("Nu am putut scoate roiul din stupină.");
      return;
    }

    getData();
  }

  async function updateStupStatus(stupId, status) {
    const { error } = await supabase
      .from("stupi")
      .update({ status })
      .eq("id", stupId);

    if (error) {
      alert("Nu am putut modifica statusul.");
      return;
    }

    setStupi((prev) =>
      prev.map((stup) =>
        stup.id === stupId ? { ...stup, status } : stup
      )
    );
  }

  async function updateRoiStatus(roiId, status) {
    const { error } = await supabase
      .from("roiuri")
      .update({ status })
      .eq("id", roiId);

    if (error) {
      alert("Nu am putut modifica statusul.");
      return;
    }

    setRoiuri((prev) =>
      prev.map((roi) =>
        roi.id === roiId ? { ...roi, status } : roi
      )
    );
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
    String(familie.numar || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalFamilii = familiiTabel.length;

  const totalMiere = familiiTabel.reduce(
    (sum, f) => sum + Number(f.miere_kg || 0),
    0
  );

  const totalPuiet = familiiTabel.reduce(
    (sum, f) => sum + Number(f.rame_puiet || 0),
    0
  );

  const totalMiereRame = familiiTabel.reduce(
    (sum, f) => sum + Number(f.rame_miere || 0),
    0
  );

  const totalPolen = familiiTabel.reduce(
    (sum, f) => sum + Number(f.rame_polen || 0),
    0
  );

  const cuMatca = familiiTabel.filter(
    (f) => f.are_matca === true || f.matca === "Da"
  ).length;

  const faraMatca = totalFamilii - cuMatca;

  const active = familiiTabel.filter(
    (f) => f.status === "Activ"
  ).length;

  const inactive = familiiTabel.filter(
    (f) => f.status === "Inactiv"
  ).length;

  const stupiDisponibili = availableStupi.filter(
    (stup) => !stup.stupina_id || stup.stupina_id !== id
  );

  const roiuriDisponibile = availableRoiuri.filter(
    (roi) => !roi.stupina_id || roi.stupina_id !== id
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
            <h1 style={styles.title}>
              🐝 {stupina.nume}
            </h1>

            <div style={styles.location}>
              📍 {stupina.locatie || "Locație nespecificată"}
            </div>

            {stupina.observatii && (
              <div style={styles.notes}>
                {stupina.observatii}
              </div>
            )}
          </div>

          <div style={styles.headerButtons}>
            <button
              onClick={() => setShowAddStup(true)}
              style={styles.primaryButton}
            >
              ➕ Adaugă stup existent
            </button>

            <button
              onClick={() => setShowAddRoi(true)}
              style={styles.secondaryButton}
            >
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
            🍯 {totalMiereRame} rame miere ·
            🌼 {totalPolen} rame polen
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
              <br />
              Folosește butoanele de mai sus pentru a adăuga stupi sau roiuri existente.
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
                              background: esteStup
                                ? "#e8f5e9"
                                : "#fff3cd",
                            }}
                          >
                            {familie.tipFamilie}
                          </span>
                        </td>

                        <td>
                          {esteStup ? (
                            <Link
                              href={`/stupi/${familie.numar}`}
                              style={styles.numberLink}
                            >
                              #{familie.numar}
                            </Link>
                          ) : (
                            <strong>#{familie.numar}</strong>
                          )}
                        </td>

                        <td>
                          {familie.matca || "-"}
                        </td>

                        <td>
                          {familie.are_matca === true ||
                          familie.matca === "Da"
                            ? "✅ Da"
                            : "❌ Nu"}
                        </td>

                        <td>
                          {familie.an_matca || "-"}
                        </td>

                        <td>
                          {familie.rame ?? 0}
                        </td>

                        <td>
                          {familie.rame_puiet ?? 0}
                        </td>

                        <td>
                          {Number(familie.miere_kg || 0).toFixed(1)}
                        </td>

                        <td>
                          {familie.rame_polen ?? 0}
                        </td>

                        <td>
                          <select
                            value={familie.status || ""}
                            onChange={(e) => {
                              if (esteStup) {
                                updateStupStatus(
                                  familie.id,
                                  e.target.value
                                );
                              } else {
                                updateRoiStatus(
                                  familie.id,
                                  e.target.value
                                );
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

                        <td>
                          {familie.origine || "-"}
                        </td>

                        <td style={styles.observatii}>
                          {familie.observatii || "-"}
                        </td>

                        <td>
                          <div style={styles.actions}>

                            <button
                              onClick={() =>
                                openVerification(familie)
                              }
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

        {showAddStup && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>

              <div style={styles.modalHeader}>
                <h2>Adaugă stup existent</h2>

                <button
                  onClick={() => setShowAddStup(false)}
                  style={styles.close}
                >
                  ✕
                </button>
              </div>

              <p>
                Alege un stup existent din baza principală.
                Nu se va crea un stup nou.
              </p>

              <div style={styles.list}>
                {stupiDisponibili.length === 0 ? (
                  <div style={styles.empty}>
                    Nu există stupi disponibili.
                  </div>
                ) : (
                  stupiDisponibili.map((stup) => (
                    <button
                      key={stup.id}
                      onClick={() => addExistingStup(stup)}
                      style={styles.listItem}
                    >
                      <strong>
                        Stup #{stup.numar_stup}
                      </strong>

                      <span>
                        {stup.stupina_id
                          ? "Mută din altă stupină"
                          : "Fără locație"}
                      </span>
                    </button>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {showAddRoi && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>

              <div style={styles.modalHeader}>
                <h2>Adaugă roi existent</h2>

                <button
                  onClick={() => setShowAddRoi(false)}
                  style={styles.close}
                >
                  ✕
                </button>
              </div>

              <p>
                Alege un roi sau nucleu existent.
              </p>

              <div style={styles.list}>
                {roiuriDisponibile.length === 0 ? (
                  <div style={styles.empty}>
                    Nu există roiuri/nuclee disponibile.
                  </div>
                ) : (
                  roiuriDisponibile.map((roi) => (
                    <button
                      key={roi.id}
                      onClick={() => addExistingRoi(roi)}
                      style={styles.listItem}
                    >
                      <strong>
                        {roi.tip || "Roi"} #{roi.numar}
                      </strong>

                      <span>
                        {roi.stupina_id
                          ? "Mută din altă stupină"
                          : "Fără locație"}
                      </span>
                    </button>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {showVerification && selectedFamilie && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>

              <div style={styles.modalHeader}>
                <h2>
                  📝 Verificare{" "}
                  {selectedFamilie.tipFamilie} #
                  {selectedFamilie.numar}
                </h2>

                <button
                  onClick={() => setShowVerification(false)}
                  style={styles.close}
                >
                  ✕
                </button>
              </div>

              <div style={styles.formGrid}>

                <label>
                  Data
                  <input
                    type="date"
                    value={verification.data_verificare}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        data_verificare: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </label>

                <label>
                  Rasa matcă
                  <input
                    value={verification.matca}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        matca: e.target.value,
                      })
                    }
                    style={styles.input}
                    placeholder="Ex: Carnica"
                  />
                </label>

                <label>
                  Are matcă?
                  <select
                    value={verification.are_matca ? "Da" : "Nu"}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        are_matca: e.target.value === "Da",
                      })
                    }
                    style={styles.input}
                  >
                    <option value="Da">Da</option>
                    <option value="Nu">Nu</option>
                  </select>
                </label>

                <label>
                  An matcă
                  <input
                    type="number"
                    value={verification.an_matca}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        an_matca: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </label>

                <label>
                  Rame
                  <input
                    type="number"
                    value={verification.rame}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        rame: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </label>

                <label>
                  Rame puiet
                  <input
                    type="number"
                    value={verification.rame_puiet}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        rame_puiet: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </label>

                <label>
                  Rame miere
                  <input
                    type="number"
                    value={verification.rame_miere}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        rame_miere: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </label>

                <label>
                  Rame polen
                  <input
                    type="number"
                    value={verification.rame_polen}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        rame_polen: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  Observații
                  <textarea
                    value={verification.observatii}
                    onChange={(e) =>
                      setVerification({
                        ...verification,
                        observatii: e.target.value,
                      })
                    }
                    style={styles.textarea}
                    rows={4}
                  />
                </label>

              </div>

              <button
                onClick={saveVerification}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving
                  ? "Se salvează..."
                  : "💾 Salvează verificarea"}
              </button>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f6",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1600px",
    margin: "0 auto",
  },

  loading: {
    textAlign: "center",
    padding: "80px",
    fontSize: "20px",
  },

  back: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#167a42",
    textDecoration: "none",
    fontWeight: "bold",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  title: {
    fontSize: "34px",
    margin: 0,
  },

  location: {
    marginTop: "8px",
    color: "#555",
    fontSize: "17px",
  },

  notes: {
    marginTop: "8px",
    color: "#777",
  },

  headerButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  primaryButton: {
    border: "none",
    background: "#167a42",
    color: "white",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  secondaryButton: {
    border: "none",
    background: "#e8a928",
    color: "#111",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  stat: {
    background: "white",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  alert: {
    background: "#fff3cd",
    border: "1px solid #ffe69c",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },

  search: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "300px",
    maxWidth: "100%",
  },

  smallStats: {
    padding: "12px",
    background: "white",
    borderRadius: "8px",
  },

  card: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },

  cardHeader: {
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },

  badge: {
    padding: "5px 8px",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  numberLink: {
    color: "#167a42",
    fontWeight: "bold",
    textDecoration: "none",
  },

  select: {
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  observatii: {
    maxWidth: "220px",
  },

  actions: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },

  verifyButton: {
    background: "#167a42",
    color: "white",
    border: "none",
    padding: "7px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  removeButton: {
    background: "#f3f3f3",
    border: "1px solid #ccc",
    padding: "7px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#666",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    background: "white",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "14px",
    padding: "25px",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  close: {
    border: "none",
    background: "transparent",
    fontSize: "22px",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "15px",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px",
    background: "#f5f7f6",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },

  input: {
    display: "block",
    width: "100%",
    marginTop: "6px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    boxSizing: "border-box",
  },

  textarea: {
    display: "block",
    width: "100%",
    marginTop: "6px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    boxSizing: "border-box",
    resize: "vertical",
  },

  saveButton: {
    width: "100%",
    marginTop: "20px",
    padding: "13px",
    background: "#167a42",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
