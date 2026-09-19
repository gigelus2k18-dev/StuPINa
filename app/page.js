
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [stupi, setStupi] = useState([]);
  const [tratamente, setTratamente] = useState([]);
  const [verificari, setVerificari] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showTreatment, setShowTreatment] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const [selectedStup, setSelectedStup] = useState(null);

  const [savingTreatment, setSavingTreatment] = useState(false);
  const [savingVerification, setSavingVerification] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(null);

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

    const {
      data: stupiData,
      error: stupiError,
    } = await supabase
      .from("stupi")
      .select("*")
      .order("numar_stup", {
        ascending: true,
      });

    if (stupiError) {
      console.error(stupiError);
      alert("Nu s-au putut încărca stupii.");
      setLoading(false);
      return;
    }

    setStupi(stupiData || []);

    const {
      data: tratamenteData,
      error: tratamenteError,
    } = await supabase
      .from("tratamente")
      .select("*")
      .order("data_tratament", {
        ascending: false,
      });

    if (tratamenteError) {
      console.error(tratamenteError);
      alert(
        "Nu s-au putut încărca tratamentele: " +
          tratamenteError.message
      );
    } else {
      setTratamente(tratamenteData || []);
    }

    const {
      data: verificariData,
      error: verificariError,
    } = await supabase
      .from("verificari")
      .select("*")
      .order("data_verificare", {
        ascending: false,
      });

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
      data: new Date()
        .toISOString()
        .split("T")[0],
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
      observatii:
        verification.observatii || null,
    };

    const {
      data,
      error,
    } = await supabase
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
      setVerificari((prev) => [
        data,
        ...prev,
      ]);

      setShowVerification(false);

      alert(
        "Verificarea pentru stupul " +
          selectedStup.numar_stup +
          " a fost salvată!"
      );
    }

    setSavingVerification(false);
  }

  async function applyTreatmentToAll() {
    if (!treatment.tip || !treatment.data) {
      alert("Completează tratamentul și data.");
      return;
    }

    const confirmare = window.confirm(
      "Ești sigur că vrei să adaugi tratamentul \"" +
        treatment.tip +
        "\" pentru toți cei " +
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

    const {
      data,
      error,
    } = await supabase
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
        data: new Date()
          .toISOString()
          .split("T")[0],
        detalii: "",
      });
    }

    setSavingTreatment(false);
  }

  async function deleteTreatmentBatch(batch) {
    const confirmare = window.confirm(
      "Sigur vrei să ștergi tratamentul \"" +
        batch.tip +
        "\" din " +
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
      .eq(
        "data_tratament",
        batch.data_tratament
      );

    if (batch.detalii) {
      query = query.eq(
        "detalii",
        batch.detalii
      );
    } else {
      query = query.is(
        "detalii",
        null
      );
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
        <h1 style={styles.title}>
          🐝 StuPINa
        </h1>
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

  const filteredStupi = stupi.filter(
    (stup) =>
      String(stup.numar_stup)
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

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
              + încă{" "}
              {alerte.length - 12} stupi
            </p>
          )}

        </section>
      )}

      <section style={styles.searchSection}>

        <div style={styles.searchTitle}>
          🔍 Caută un stup
        </div>

        <input
          style={styles.searchInput}
          type="text"
          placeholder="Introdu numărul stupului..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </section>

      <section style={styles.actionsSection}>

        <Link
          href="/statistici"
          style={styles.statsButton}
        >
          📊 Statistici complete
        </Link>

        <button
          style={styles.treatmentButton}
          onClick={() =>
            setShowTreatment(true)
          }
        >
          💊 Tratamente pentru toți stupii
        </button>

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
                      📅{" "}
                      {batch.data_tratament}
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
                        📝{" "}
                        {batch.detalii}
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
                    {deletingBatch ===
                    batch.key
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

                  <td
                    style={
                      styles.tdNumber
                    }
                  >
                    <Link
                      href={
                        "/stupi/" +
                        stup.numar_stup
                      }
                      style={
                        styles.stupLink
                      }
                    >
                      Stupul{" "}
                      {stup.numar_stup}
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

