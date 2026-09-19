
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [stupi, setStupi] = useState([]);
  const [roiuri, setRoiuri] = useState([]);
  const [tratamente, setTratamente] = useState([]);
  const [verificari, setVerificari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showTreatment, setShowTreatment] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showAddStup, setShowAddStup] = useState(false);

  const [selectedStup, setSelectedStup] = useState(null);

  const [savingTreatment, setSavingTreatment] = useState(false);
  const [savingVerification, setSavingVerification] = useState(false);
  const [savingStup, setSavingStup] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(null);

  const [newStupNumber, setNewStupNumber] = useState("");

  const [treatment, setTreatment] = useState({
    tip: "Amitraz",
    data: new Date().toISOString().split("T")[0],
    detalii: "",
  });

  const [verification, setVerification] = useState({
    data: new Date().toISOString().split("T")[0],
    matca: "",
    an_matca: "",
    rame: "",
    rame_puiet: "",
    rame_miere: "",
    rame_polen: "",
    observatii: "",
  });

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    setLoading(true);

    const { data: stupiData, error: stupiError } = await supabase
      .from("stupi")
      .select("*")
      .order("numar_stup", { ascending: true });

    if (stupiError) {
      console.error(stupiError);
      alert("Nu s-au putut încărca stupii.");
      setLoading(false);
      return;
    }

    setStupi(stupiData || []);

    const { data: roiuriData, error: roiuriError } = await supabase
      .from("roiuri")
      .select("*")
      .order("numar", { ascending: true });

    if (roiuriError) {
      console.error(roiuriError);
      alert(
        "Nu s-au putut încărca roiurile/nucleele: " +
          roiuriError.message
      );
    } else {
      setRoiuri(roiuriData || []);
    }

    const { data: tratamenteData, error: tratamenteError } =
      await supabase
        .from("tratamente")
        .select("*")
        .order("data_tratament", { ascending: false });

    if (tratamenteError) {
      console.error(tratamenteError);
      alert(
        "Nu s-au putut încărca tratamentele: " +
          tratamenteError.message
      );
    } else {
      setTratamente(tratamenteData || []);
    }

    const { data: verificariData, error: verificariError } =
      await supabase
        .from("verificari")
        .select("*")
        .order("data_verificare", { ascending: false });

    if (verificariError) {
      console.error(verificariError);
      alert(
        "Nu s-au putut încărca verificările: " +
          verificariError.message
      );
    } else {
      setVerificari(verificariData || []);
    }

    setLoading(false);
  }

  function openVerification(stup) {
    setSelectedStup(stup);

    setVerification({
      data: new Date().toISOString().split("T")[0],
      matca: stup.matca || "",
      an_matca: stup.an_matca || "",
      rame: stup.rame || "",
      rame_puiet: stup.rame_puiet || "",
      rame_miere: stup.rame_miere || "",
      rame_polen: stup.rame_polen || "",
      observatii: "",
    });

    setShowVerification(true);
  }

  async function saveVerification() {
    if (!selectedStup) return;

    if (!verification.data) {
      alert("Completează data verificării.");
      return;
    }

    setSavingVerification(true);

    const record = {
      stup_id: selectedStup.id,
      data_verificare: verification.data,
      matca: verification.matca || null,
      an_matca: verification.an_matca
        ? Number(verification.an_matca)
        : null,
      rame: verification.rame
        ? Number(verification.rame)
        : null,
      rame_puiet: verification.rame_puiet
        ? Number(verification.rame_puiet)
        : null,
      rame_miere: verification.rame_miere
        ? Number(verification.rame_miere)
        : null,
      rame_polen: verification.rame_polen
        ? Number(verification.rame_polen)
        : null,
      observatii: verification.observatii || null,
    };

    const { data, error } = await supabase
      .from("verificari")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(
        "Eroare la salvarea verificării: " +
          error.message
      );
    } else {
      setVerificari((prev) => [data, ...prev]);
      setShowVerification(false);

      alert(
        "Verificarea pentru stupul " +
          selectedStup.numar_stup +
          " a fost salvată!"
      );
    }

    setSavingVerification(false);
  }

  async function addStup() {
    const number = newStupNumber.trim();

    if (!number) {
      alert("Introdu numărul stupului.");
      return;
    }

    const numericNumber = Number(number);

    if (!Number.isInteger(numericNumber) || numericNumber <= 0) {
      alert("Numărul stupului trebuie să fie un număr întreg pozitiv.");
      return;
    }

    const alreadyExists = stupi.some(
      (stup) => Number(stup.numar_stup) === numericNumber
    );

    if (alreadyExists) {
      alert("Există deja un stup cu numărul " + numericNumber + ".");
      return;
    }

    setSavingStup(true);

    const { data, error } = await supabase
      .from("stupi")
      .insert({
        numar_stup: numericNumber,
        matca: null,
        an_matca: null,
        rame: null,
        rame_puiet: null,
        rame_miere: null,
        rame_polen: null,
        miere_kg: 0,
        status: "Activ",
        observatii: null,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(
        "Eroare la adăugarea stupului: " +
          error.message
      );
    } else {
      setStupi((prev) =>
        [...prev, data].sort(
          (a, b) =>
            Number(a.numar_stup) -
            Number(b.numar_stup)
        )
      );

      setNewStupNumber("");
      setShowAddStup(false);

      alert(
        "Stupul " +
          numericNumber +
          " a fost adăugat cu succes!"
      );
    }

    setSavingStup(false);
  }

  async function updateStupStatus(stupId, status) {
    const { error } = await supabase
      .from("stupi")
      .update({ status })
      .eq("id", stupId);

    if (error) {
      console.error(error);
      alert(
        "Eroare la schimbarea statusului: " +
          error.message
      );
      return;
    }

    setStupi((prev) =>
      prev.map((stup) =>
        stup.id === stupId
          ? { ...stup, status }
          : stup
      )
    );
  }

  async function updateAllStatuses(status) {
    const confirmare = window.confirm(
      "Sigur vrei să setezi toți cei " +
        stupi.length +
        " stupi ca „" +
        status +
        "”?"
    );

    if (!confirmare) return;

    const { error } = await supabase
      .from("stupi")
      .update({ status })
      .not("id", "is", null);

    if (error) {
      console.error(error);
      alert(
        "Eroare la schimbarea statusurilor: " +
          error.message
      );
      return;
    }

    setStupi((prev) =>
      prev.map((stup) => ({
        ...stup,
        status,
      }))
    );

    alert(
      "Toți cei " +
        stupi.length +
        " stupi au fost setați ca „" +
        status +
        "”."
    );
  }

  async function applyTreatmentToAll() {
    if (!treatment.tip || !treatment.data) {
      alert("Completează tratamentul și data.");
      return;
    }

    const confirmare = window.confirm(
      'Ești sigur că vrei să adaugi tratamentul "' +
        treatment.tip +
        '" pentru toți cei ' +
        stupi.length +
        " stupi?"
    );

    if (!confirmare) return;

    setSavingTreatment(true);

    const records = stupi.map((stup) => ({
      stup_id: stup.id,
      tip: treatment.tip,
      data_tratament: treatment.data,
      detalii: treatment.detalii || null,
    }));

    const { data, error } = await supabase
      .from("tratamente")
      .insert(records)
      .select();

    if (error) {
      console.error(error);
      alert(
        "Eroare la adăugarea tratamentului: " +
          error.message
      );
    } else {
      setTratamente((prev) => [
        ...(data || []),
        ...prev,
      ]);

      alert(
        "Tratamentul a fost adăugat pentru toți cei " +
          stupi.length +
          " stupi!"
      );

      setShowTreatment(false);

      setTreatment({
        tip: "Amitraz",
        data: new Date().toISOString().split("T")[0],
        detalii: "",
      });
    }

    setSavingTreatment(false);
  }

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

  if (loading) {
    return (
      <main style={styles.page}>
        <h1 style={styles.title}>🐝 StuPINa</h1>
        <p>Se încarcă stupina...</p>
      </main>
    );
  }

  const totalMiere = stupi.reduce(
    (total, stup) =>
      total + Number(stup.miere_kg || 0),
    0
  );

  const totalPuiet = stupi.reduce(
    (total, stup) =>
      total + Number(stup.rame_puiet || 0),
    0
  );

  const totalRameMiere = stupi.reduce(
    (total, stup) =>
      total + Number(stup.rame_miere || 0),
    0
  );

  const totalRamePolen = stupi.reduce(
    (total, stup) =>
      total + Number(stup.rame_polen || 0),
    0
  );

  const cuMatca = stupi.filter(
    (stup) => stup.matca
  ).length;

  const faraMatca =
    stupi.length - cuMatca;

  const alerte = stupi.filter(
    (stup) =>
      !stup.matca ||
      Number(stup.rame_puiet || 0) === 0
  );

  const stupiActivi = stupi.filter(
    (stup) => stup.status === "Activ"
  ).length;

  const stupiInactivi = stupi.filter(
    (stup) => stup.status === "Inactiv"
  ).length;

  const searchTerm = search.trim().toLowerCase();

  const filteredStupi = stupi.filter((stup) =>
    String(stup.numar_stup)
      .toLowerCase()
      .includes(searchTerm)
  );

  const filteredRoiuri = roiuri.filter((roi) =>
    String(roi.numar)
      .toLowerCase()
      .includes(searchTerm)
  );

  const hasSearch = searchTerm.length > 0;

  const batchesMap = {};

  tratamente.forEach((tratament) => {
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
        data_tratament:
          tratament.data_tratament,
        detalii:
          tratament.detalii || "",
        count: 0,
      };
    }

    batchesMap[key].count++;
  });

  const treatmentBatches =
    Object.values(batchesMap);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            🐝 StuPINa
          </h1>

          <p style={styles.subtitle}>
            Gestiunea stupinei
          </p>
        </div>

        <div style={styles.count}>
          {stupi.length} stupi
        </div>
      </header>

      <section style={styles.statsGrid}>
        <StatCard
          icon="🐝"
          title="Total stupi"
          value={stupi.length}
        />

        <StatCard
          icon="🟢"
          title="Stupi activi"
          value={stupiActivi}
        />

        <StatCard
          icon="🔴"
          title="Stupi inactivi"
          value={stupiInactivi}
        />

        <StatCard
          icon="👑"
          title="Cu matcă"
          value={cuMatca}
        />

        <StatCard
          icon="⚠️"
          title="Fără matcă"
          value={faraMatca}
        />

        <StatCard
          icon="🍯"
          title="Miere"
          value={
            totalMiere.toFixed(1) +
            " kg"
          }
        />

        <StatCard
          icon="🐣"
          title="Rame cu puiet"
          value={totalPuiet}
        />

        <StatCard
          icon="🌼"
          title="Rame cu polen"
          value={totalRamePolen}
        />

        <StatCard
          icon="🍯"
          title="Rame cu miere"
          value={totalRameMiere}
        />
      </section>

      {alerte.length > 0 && (
        <section style={styles.alertSection}>
          <div style={styles.alertTitle}>
            🚨 Atenție
          </div>

          <p style={styles.alertText}>
            Sunt {alerte.length} stupi care
            necesită atenție.
          </p>

          <div style={styles.alertList}>
            {alerte.slice(0, 12).map(
              (stup) => (
                <Link
                  key={stup.id}
                  href={
                    "/stupi/" +
                    stup.numar_stup
                  }
                  style={styles.alertItem}
                >
                  Stup {stup.numar_stup}
                  {!stup.matca
                    ? " — fără matcă"
                    : Number(
                        stup.rame_puiet || 0
                      ) === 0
                    ? " — fără puiet"
                    : ""}
                </Link>
              )
            )}
          </div>

          {alerte.length > 12 && (
            <p style={styles.moreAlert}>
              + încă {alerte.length - 12} stupi
            </p>
          )}
        </section>
      )}

      <section style={styles.searchSection}>
        <div style={styles.searchTitle}>
          🔍 Caută în stupină
        </div>

        <input
          style={styles.searchInput}
          type="text"
          placeholder="Ex: 25, 1234, R1, R15..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {hasSearch && (
          <div style={styles.searchResults}>
            {filteredStupi.length === 0 &&
            filteredRoiuri.length === 0 ? (
              <div style={styles.noSearchResults}>
                Nu am găsit niciun stup, roi sau nucleu
                pentru „{search}”.
              </div>
            ) : (
              <>
                {filteredStupi.length > 0 && (
                  <div style={styles.searchGroup}>
                    <div style={styles.searchGroupTitle}>
                      🐝 Stupi
                    </div>

                    <div style={styles.searchItems}>
                      {filteredStupi.map((stup) => (
                        <Link
                          key={"stup-" + stup.id}
                          href={
                            "/stupi/" +
                            stup.numar_stup
                          }
                          style={styles.searchStupItem}
                        >
                          <div>
                            <strong>
                              Stupul {stup.numar_stup}
                            </strong>

                            <div style={styles.searchItemDetails}>
                              {stup.matca
                                ? "👑 Cu matcă"
                                : "⚠️ Fără matcă"}
                              {" • "}
                              {stup.status || "Fără status"}
                            </div>
                          </div>

                          <span>→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {filteredRoiuri.length > 0 && (
                  <div style={styles.searchGroup}>
                    <div style={styles.searchGroupTitle}>
                      🐝 Roiuri / Nuclee
                    </div>

                    <div style={styles.searchItems}>
                      {filteredRoiuri.map((roi) => (
                        <Link
                          key={"roi-" + roi.id}
                          href="/roiuri"
                          style={styles.searchRoiItem}
                        >
                          <div>
                            <strong>
                              {roi.tip} {roi.numar}
                            </strong>

                            <div style={styles.searchItemDetails}>
                              {roi.status || "Fără status"}
                              {roi.origine
                                ? " • Origine: " +
                                  roi.origine
                                : ""}
                            </div>
                          </div>

                          <span>→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <section style={styles.actionsSection}>
        <button
          style={styles.addStupButton}
          onClick={() => setShowAddStup(true)}
        >
          ➕ Adaugă stup
        </button>

        <Link
          href="/statistici"
          style={styles.statsButton}
        >
          📊 Statistici complete
        </Link>

        <button
          style={styles.treatmentButton}
          onClick={() => setShowTreatment(true)}
        >
          💊 Tratamente pentru toți stupii
        </button>

        <Link
          href="/tratamente"
          style={styles.historyButton}
        >
          📜 Istoric tratamente
        </Link>

        <Link
          href="/roiuri"
          style={styles.historyButton}
        >
          🐝 Roiuri / Nuclee
        </Link>
      </section>

      <section style={styles.statusSection}>
        <div style={styles.statusHeader}>
          <div>
            <h2 style={styles.statusTitle}>
              🔄 Status stupi
            </h2>

            <p style={styles.statusSubtitle}>
              Poți schimba statusul fiecărui stup separat
              sau al tuturor deodată.
            </p>
          </div>

          <div style={styles.statusActions}>
            <button
              style={styles.activateAllButton}
              onClick={() =>
                updateAllStatuses("Activ")
              }
            >
              🟢 Toți activi
            </button>

            <button
              style={styles.deactivateAllButton}
              onClick={() =>
                updateAllStatuses("Inactiv")
              }
            >
              🔴 Toți inactivi
            </button>
          </div>
        </div>

        <div style={styles.statusSummary}>
          <span style={styles.activeSummary}>
            🟢 {stupiActivi} activi
          </span>

          <span style={styles.inactiveSummary}>
            🔴 {stupiInactivi} inactivi
          </span>

          <span style={styles.noStatusSummary}>
            ⚪ {stupi.length - stupiActivi - stupiInactivi} fără status
          </span>
        </div>
      </section>

      <section style={styles.batchSection}>
        <div style={styles.batchHeader}>
          <h2 style={styles.batchTitle}>
            📜 Tratamente înregistrate
          </h2>

          <p style={styles.batchSubtitle}>
            De aici poți șterge o tranșă
            aplicată mai multor stupi.
          </p>
        </div>

        {treatmentBatches.length === 0 ? (
          <div style={styles.emptyBatches}>
            Nu există tratamente
            înregistrate.
          </div>
        ) : (
          <div style={styles.batchList}>
            {treatmentBatches.map(
              (batch) => (
                <div
                  key={batch.key}
                  style={styles.batchItem}
                >
                  <div
                    style={
                      styles.batchContent
                    }
                  >
                    <div
                      style={
                        styles.batchTreatment
                      }
                    >
                      💊 {batch.tip}
                    </div>

                    <div
                      style={
                        styles.batchInfo
                      }
                    >
                      📅 {batch.data_tratament}
                      {" • "}
                      🐝 {batch.count}{" "}
                      {batch.count === 1
                        ? "stup"
                        : "stupi"}
                    </div>

                    {batch.detalii && (
                      <div
                        style={
                          styles.batchDetails
                        }
                      >
                        📝 {batch.detalii}
                      </div>
                    )}
                  </div>

                  <button
                    style={
                      styles.deleteBatchButton
                    }
                    onClick={() =>
                      deleteTreatmentBatch(
                        batch
                      )
                    }
                    disabled={
                      deletingBatch ===
                      batch.key
                    }
                  >
                    {deletingBatch === batch.key
                      ? "Se șterge..."
                      : "🗑️ Șterge tranșa"}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                Nr. stup
              </th>

              <th style={styles.th}>
                Matcă
              </th>

              <th style={styles.th}>
                An matcă
              </th>

              <th style={styles.th}>
                Rame
              </th>

              <th style={styles.th}>
                Puiet
              </th>

              <th style={styles.th}>
                Miere kg
              </th>

              <th style={styles.th}>
                Polen
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Observații
              </th>

              <th style={styles.th}>
                Acțiune
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredStupi.map(
              (stup) => (
                <tr
                  key={stup.id}
                  style={styles.row}
                >
                  <td style={styles.tdNumber}>
                    <Link
                      href={
                        "/stupi/" +
                        stup.numar_stup
                      }
                      style={styles.stupLink}
                    >
                      Stupul {stup.numar_stup}
                    </Link>
                  </td>

                  <td style={styles.td}>
                    {stup.matca || "—"}
                  </td>

                  <td style={styles.td}>
                    {stup.an_matca || "—"}
                  </td>

                  <td style={styles.td}>
                    {stup.rame || "—"}
                  </td>

                  <td style={styles.td}>
                    {stup.rame_puiet || "—"}
                  </td>

                  <td style={styles.td}>
                    {stup.miere_kg
                      ? stup.miere_kg + " kg"
                      : "—"}
                  </td>

                  <td style={styles.td}>
                    {stup.rame_polen || "—"}
                  </td>

                  <td style={styles.td}>
                    <select
                      value={stup.status || ""}
                      onChange={(e) =>
                        updateStupStatus(
                          stup.id,
                          e.target.value
                        )
                      }
                      style={{
                        ...styles.statusSelect,
                        ...(stup.status === "Activ"
                          ? styles.statusSelectActive
                          : {}),
                        ...(stup.status === "Inactiv"
                          ? styles.statusSelectInactive
                          : {}),
                      }}
                    >
                      <option value="">
                        Selectează
                      </option>

                      <option value="Activ">
                        Activ
                      </option>

                      <option value="Inactiv">
                        Inactiv
                      </option>
                    </select>
                  </td>

                  <td style={styles.td}>
                    {stup.observatii || "—"}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.verifyButton}
                      onClick={() =>
                        openVerification(stup)
                      }
                    >
                      📝 Verifică
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {!hasSearch && filteredStupi.length === 0 && (
        <div style={styles.noResults}>
          Nu există stupi înregistrati.
        </div>
      )}

      {showAddStup && (
        <div style={styles.overlay}>
          <div style={styles.smallModal}>
            <button
              style={styles.closeButton}
              onClick={() =>
                setShowAddStup(false)
              }
            >
              ×
            </button>

            <h2 style={styles.modalTitle}>
              ➕ Adaugă stup nou
            </h2>

            <p style={styles.modalDescription}>
              Introdu numărul noului stup.
            </p>

            <label style={styles.label}>
              Număr stup
            </label>

            <input
              style={styles.input}
              type="number"
              min="1"
              value={newStupNumber}
              placeholder="Ex: 201"
              onChange={(e) =>
                setNewStupNumber(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addStup();
                }
              }}
              autoFocus
            />

            <button
              style={styles.confirmButton}
              onClick={addStup}
              disabled={savingStup}
            >
              {savingStup
                ? "Se adaugă..."
                : "💾 Adaugă stupul"}
            </button>
          </div>
        </div>
      )}

      {showVerification && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button
              style={styles.closeButton}
              onClick={() =>
                setShowVerification(false)
              }
            >
              ×
            </button>

            <h2 style={styles.modalTitle}>
              📝 Verificare Stupul{" "}
              {selectedStup?.numar_stup}
            </h2>

            <label style={styles.label}>
              Data verificării
            </label>

            <input
              style={styles.input}
              type="date"
              value={verification.data}
              onChange={(e) =>
                setVerification({
                  ...verification,
                  data: e.target.value,
                })
              }
            />

            <label style={styles.label}>
              Matcă
            </label>

            <select
              style={styles.input}
              value={verification.matca}
              onChange={(e) =>
                setVerification({
                  ...verification,
                  matca: e.target.value,
                })
              }
            >
              <option value="">
                Nespecificat
              </option>

              <option value="Da">
                Da
              </option>

              <option value="Nu">
                Nu
              </option>
            </select>

            <label style={styles.label}>
              An matcă
            </label>

            <input
              style={styles.input}
              type="number"
              value={verification.an_matca}
              onChange={(e) =>
                setVerification({
                  ...verification,
                  an_matca: e.target.value,
                })
              }
            />

            <div style={styles.numberGrid}>
              <NumberField
                label="Rame"
                value={verification.rame}
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame: value,
                  })
                }
              />

              <NumberField
                label="Rame puiet"
                value={verification.rame_puiet}
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame_puiet: value,
                  })
                }
              />

              <NumberField
                label="Rame miere"
                value={verification.rame_miere}
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame_miere: value,
                  })
                }
              />

              <NumberField
                label="Rame polen"
                value={verification.rame_polen}
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame_polen: value,
                  })
                }
              />
            </div>

            <label style={styles.label}>
              Observații
            </label>

            <textarea
              style={styles.textarea}
              placeholder="Ex: familie puternică, puiet compact..."
              value={verification.observatii}
              onChange={(e) =>
                setVerification({
                  ...verification,
                  observatii: e.target.value,
                })
              }
            />

            <button
              style={styles.confirmButton}
              onClick={saveVerification}
              disabled={savingVerification}
            >
              {savingVerification
                ? "Se salvează..."
                : "💾 Salvează verificarea"}
            </button>
          </div>
        </div>
      )}

      {showTreatment && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button
              style={styles.closeButton}
              onClick={() =>
                setShowTreatment(false)
              }
            >
              ×
            </button>

            <h2 style={styles.modalTitle}>
              💊 Tratament pentru toți stupii
            </h2>

            <p style={styles.modalDescription}>
              Tratamentul va fi adăugat în
              istoricul tuturor celor{" "}
              {stupi.length} stupi.
            </p>

            <label style={styles.label}>
              Tratament
            </label>

            <select
              style={styles.input}
              value={treatment.tip}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
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

            <label style={styles.label}>
              Data tratamentului
            </label>

            <input
              style={styles.input}
              type="date"
              value={treatment.data}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  data: e.target.value,
                })
              }
            />

            <label style={styles.label}>
              Detalii
            </label>

            <textarea
              style={styles.textarea}
              placeholder="Ex: Penultima tranșă, 2 pufuri..."
              value={treatment.detalii}
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  detalii: e.target.value,
                })
              }
            />

            <button
              style={styles.confirmButton}
              onClick={applyTreatmentToAll}
              disabled={savingTreatment}
            >
              {savingTreatment
                ? "Se adaugă..."
                : "💾 Aplică la toți cei " +
                  stupi.length +
                  " stupi"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>
        <div style={styles.statTitle}>
          {title}
        </div>

        <div style={styles.statValue}>
          {value}
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label style={styles.label}>
        {label}
      </label>

      <input
        style={styles.input}
        type="number"
        min="0"
        value={value}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#666",
  },

  count: {
    background: "#fff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontWeight: "bold",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.06)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
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

  alertSection: {
    background: "#fff4e5",
    border: "1px solid #f1c27d",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "20px",
  },

  alertTitle: {
    fontWeight: "bold",
    fontSize: "18px",
  },

  alertText: {
    marginTop: "5px",
    color: "#666",
  },

  alertList: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "12px",
  },

  alertItem: {
    background: "#fff",
    border: "1px solid #e0b56d",
    borderRadius: "8px",
    padding: "8px 10px",
    textDecoration: "none",
    color: "#7a4d00",
    fontWeight: "bold",
    fontSize: "13px",
  },

  moreAlert: {
    color: "#777",
    fontSize: "13px",
  },

  searchSection: {
    background: "#fff",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  searchTitle: {
    fontWeight: "bold",
    marginBottom: "10px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    border: "1px solid #ccc",
    borderRadius: "9px",
    fontSize: "16px",
  },

  searchResults: {
    marginTop: "15px",
    borderTop: "1px solid #eee",
    paddingTop: "15px",
  },

  searchGroup: {
    marginBottom: "15px",
  },

  searchGroupTitle: {
    fontWeight: "bold",
    fontSize: "15px",
    marginBottom: "8px",
  },

  searchItems: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  searchStupItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "11px 13px",
    borderRadius: "9px",
    background: "#f4f4f4",
    color: "#222",
    textDecoration: "none",
    border: "1px solid #e5e5e5",
  },

  searchRoiItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "11px 13px",
    borderRadius: "9px",
    background: "#fff8df",
    color: "#5d4a00",
    textDecoration: "none",
    border: "1px solid #eadb9a",
  },

  searchItemDetails: {
    marginTop: "3px",
    color: "#777",
    fontSize: "12px",
  },

  noSearchResults: {
    padding: "12px",
    textAlign: "center",
    color: "#777",
    background: "#f7f7f7",
    borderRadius: "8px",
  },

  actionsSection: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  addStupButton: {
    padding: "12px 18px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  statsButton: {
    padding: "12px 18px",
    background: "#222",
    color: "#fff",
    borderRadius: "9px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  treatmentButton: {
    padding: "12px 18px",
    background: "#8a5a25",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  historyButton: {
    padding: "12px 18px",
    background: "#5c6bc0",
    color: "#fff",
    borderRadius: "9px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  statusSection: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  statusHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  statusTitle: {
    margin: 0,
    fontSize: "21px",
  },

  statusSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#777",
    fontSize: "14px",
  },

  statusActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  activateAllButton: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 15px",
    cursor: "pointer",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: "bold",
  },

  deactivateAllButton: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 15px",
    cursor: "pointer",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: "bold",
  },

  statusSummary: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "15px",
  },

  activeSummary: {
    padding: "7px 10px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  inactiveSummary: {
    padding: "7px 10px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  noStatusSummary: {
    padding: "7px 10px",
    background: "#f3f4f6",
    color: "#6b7280",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
  },

  statusSelect: {
    minWidth: "110px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
  },

  statusSelectActive: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
  },

  statusSelectInactive: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  },

  batchSection: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  batchHeader: {
    marginBottom: "15px",
  },

  batchTitle: {
    margin: 0,
    fontSize: "21px",
  },

  batchSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#777",
    fontSize: "14px",
  },

  batchList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  batchItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f7f7f7",
    borderRadius: "10px",
    border: "1px solid #eee",
  },

  batchContent: {
    minWidth: 0,
  },

  batchTreatment: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  batchInfo: {
    color: "#777",
    fontSize: "14px",
  },

  batchDetails: {
    marginTop: "6px",
    color: "#555",
    fontSize: "14px",
  },

  emptyBatches: {
    padding: "15px",
    background: "#f7f7f7",
    borderRadius: "9px",
    color: "#777",
  },

  deleteBatchButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    flexShrink: 0,
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },

  th: {
    padding: "14px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    background: "#fafafa",
  },

  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #eee",
  },

  tdNumber: {
    padding: "12px 14px",
    borderBottom: "1px solid #eee",
    fontWeight: "bold",
  },

  stupLink: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#222",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },

  verifyButton: {
    border: "none",
    borderRadius: "8px",
    padding: "9px 12px",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  noResults: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "15px",
    textAlign: "center",
    color: "#777",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "550px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "18px",
    padding: "30px",
    position: "relative",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.2)",
  },

  smallModal: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "18px",
    padding: "30px",
    position: "relative",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.2)",
  },

  closeButton: {
    position: "absolute",
    top: "12px",
    right: "15px",
    border: "none",
    background: "transparent",
    fontSize: "30px",
    cursor: "pointer",
    color: "#777",
  },

  modalTitle: {
    marginTop: 0,
    marginBottom: "18px",
  },

  modalDescription: {
    color: "#777",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "7px",
    marginTop: "15px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
  },

  numberGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "10px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: "100px",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    resize: "vertical",
  },

  confirmButton: {
    width: "100%",
    marginTop: "25px",
    padding: "14px",
    border: "none",
    borderRadius: "9px",
    background: "#2e7d32",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },

  row: {
    transition: "background 0.2s",
  },
};

