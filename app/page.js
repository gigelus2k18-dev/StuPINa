"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [stupi, setStupi] = useState([]);
  const [roiuri, setRoiuri] = useState([]);
  const [tratamente, setTratamente] = useState([]);
  const [verificari, setVerificari] = useState([]);
  const [stupine, setStupine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showTreatment, setShowTreatment] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showAddStup, setShowAddStup] = useState(false);
  const [showAddMultiple, setShowAddMultiple] = useState(false);
  const [showAddToStupina, setShowAddToStupina] = useState(false);

  // MODIFICARE ÎN MASĂ
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkType, setBulkType] = useState("stupi");
  const [bulkScope, setBulkScope] = useState("toate");
  const [bulkStupinaId, setBulkStupinaId] = useState("");

  const [bulkSelectedStupi, setBulkSelectedStupi] = useState([]);
  const [bulkSelectedRoiuri, setBulkSelectedRoiuri] = useState([]);

  const [bulkFields, setBulkFields] = useState({
    matca: false,
    are_matca: false,
    an_matca: false,
    rame: false,
    rame_puiet: false,
    rame_miere: false,
    rame_polen: false,
    miere_kg: false,
    status: false,
    observatii: false,
  });

  const [bulkData, setBulkData] = useState({
    matca: "",
    are_matca: "Da",
    an_matca: "",
    rame: "",
    rame_puiet: "",
    rame_miere: "",
    rame_polen: "",
    miere_kg: "",
    status: "Activ",
    observatii: "",
  });

  const [savingBulkEdit, setSavingBulkEdit] = useState(false);

  const [selectedFamilie, setSelectedFamilie] = useState(null);
  const [selectedStupina, setSelectedStupina] = useState("");

  const [savingTreatment, setSavingTreatment] = useState(false);
  const [savingVerification, setSavingVerification] = useState(false);
  const [savingStup, setSavingStup] = useState(false);
  const [savingMultiple, setSavingMultiple] = useState(false);
  const [savingStupina, setSavingStupina] = useState(false);

  const [deletingBatch, setDeletingBatch] = useState(null);
  const [deletingStup, setDeletingStup] = useState(null);

  const [newStupNumber, setNewStupNumber] = useState("");
  const [multipleStupiCount, setMultipleStupiCount] = useState("");

  const [treatment, setTreatment] = useState({
    tip: "Amitraz",
    data: new Date().toISOString().split("T")[0],
    detalii: "",
  });

  const [verification, setVerification] = useState({
    data: new Date().toISOString().split("T")[0],
    matca: "",
    are_matca: "",
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

    const { data: stupineData, error: stupineError } = await supabase
      .from("stupine")
      .select("id, nume, locatie, observatii")
      .order("nume", { ascending: true });

    if (stupineError) {
      console.error(stupineError);
      alert(
        "Nu s-au putut încărca stupinele: " +
          stupineError.message
      );
    } else {
      setStupine(stupineData || []);
    }

    const { data: roiuriData, error: roiuriError } = await supabase
      .from("roiuri")
      .select("*")
      .order("numar", { ascending: true });

    if (roiuriError) {
      console.error(roiuriError);
      alert(
        "Nu s-au putut încărca roiurile/nuclee: " +
          roiuriError.message
      );
    } else {
      setRoiuri(roiuriData || []);
    }

    const { data: tratamenteData, error: tratamenteError } = await supabase
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

    const { data: verificariData, error: verificariError } = await supabase
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

  /*
   * ============================================================
   * MODIFICARE ÎN MASĂ
   * ============================================================
   */

  function resetBulkEdit() {
    setBulkType("stupi");
    setBulkScope("toate");
    setBulkStupinaId("");
    setBulkSelectedStupi([]);
    setBulkSelectedRoiuri([]);

    setBulkFields({
      matca: false,
      are_matca: false,
      an_matca: false,
      rame: false,
      rame_puiet: false,
      rame_miere: false,
      rame_polen: false,
      miere_kg: false,
      status: false,
      observatii: false,
    });

    setBulkData({
      matca: "",
      are_matca: "Da",
      an_matca: "",
      rame: "",
      rame_puiet: "",
      rame_miere: "",
      rame_polen: "",
      miere_kg: "",
      status: "Activ",
      observatii: "",
    });
  }

  function closeBulkEdit() {
    if (savingBulkEdit) return;

    setShowBulkEdit(false);
    resetBulkEdit();
  }

  function toggleBulkField(field) {
    setBulkFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }

  function getBulkAvailableStupi() {
    if (bulkScope === "stupina") {
      if (!bulkStupinaId) return [];

      return stupi.filter(
        (stup) =>
          String(stup.stupina_id) ===
          String(bulkStupinaId)
      );
    }

    if (bulkScope === "manual") {
      return stupi;
    }

    return stupi;
  }

  function getBulkAvailableRoiuri() {
    if (bulkScope === "stupina") {
      if (!bulkStupinaId) return [];

      return roiuri.filter(
        (roi) =>
          String(roi.stupina_id) ===
          String(bulkStupinaId)
      );
    }

    if (bulkScope === "manual") {
      return roiuri;
    }

    return roiuri;
  }

  function getSelectedBulkCounts() {
    let stupiCount = 0;
    let roiuriCount = 0;

    if (bulkScope === "manual") {
      if (bulkType === "stupi" || bulkType === "ambele") {
        stupiCount = bulkSelectedStupi.length;
      }

      if (bulkType === "roiuri" || bulkType === "ambele") {
        roiuriCount = bulkSelectedRoiuri.length;
      }
    } else {
      if (bulkType === "stupi" || bulkType === "ambele") {
        stupiCount = getBulkAvailableStupi().length;
      }

      if (bulkType === "roiuri" || bulkType === "ambele") {
        roiuriCount = getBulkAvailableRoiuri().length;
      }
    }

    return {
      stupi: stupiCount,
      roiuri: roiuriCount,
      total: stupiCount + roiuriCount,
    };
  }

  function toggleBulkStup(stupId) {
    setBulkSelectedStupi((prev) =>
      prev.includes(stupId)
        ? prev.filter((id) => id !== stupId)
        : [...prev, stupId]
    );
  }

  function toggleBulkRoi(roiId) {
    setBulkSelectedRoiuri((prev) =>
      prev.includes(roiId)
        ? prev.filter((id) => id !== roiId)
        : [...prev, roiId]
    );
  }

  function selectAllBulkStupi() {
    const available = getBulkAvailableStupi();

    if (available.length === 0) return;

    const allSelected = available.every((stup) =>
      bulkSelectedStupi.includes(stup.id)
    );

    if (allSelected) {
      setBulkSelectedStupi((prev) =>
        prev.filter(
          (id) => !available.some((stup) => stup.id === id)
        )
      );
    } else {
      setBulkSelectedStupi((prev) => [
        ...new Set([
          ...prev,
          ...available.map((stup) => stup.id),
        ]),
      ]);
    }
  }

  function selectAllBulkRoiuri() {
    const available = getBulkAvailableRoiuri();

    if (available.length === 0) return;

    const allSelected = available.every((roi) =>
      bulkSelectedRoiuri.includes(roi.id)
    );

    if (allSelected) {
      setBulkSelectedRoiuri((prev) =>
        prev.filter(
          (id) => !available.some((roi) => roi.id === id)
        )
      );
    } else {
      setBulkSelectedRoiuri((prev) => [
        ...new Set([
          ...prev,
          ...available.map((roi) => roi.id),
        ]),
      ]);
    }
  }

  function selectAllBulkFamilies() {
    if (bulkType === "stupi") {
      selectAllBulkStupi();
      return;
    }

    if (bulkType === "roiuri") {
      selectAllBulkRoiuri();
      return;
    }

    const stupiDisponibili = getBulkAvailableStupi();
    const roiuriDisponibile = getBulkAvailableRoiuri();

    const allStupiSelected =
      stupiDisponibili.length > 0 &&
      stupiDisponibili.every((stup) =>
        bulkSelectedStupi.includes(stup.id)
      );

    const allRoiuriSelected =
      roiuriDisponibile.length > 0 &&
      roiuriDisponibile.every((roi) =>
        bulkSelectedRoiuri.includes(roi.id)
      );

    if (
      allStupiSelected &&
      allRoiuriSelected
    ) {
      setBulkSelectedStupi([]);
      setBulkSelectedRoiuri([]);
    } else {
      setBulkSelectedStupi(
        stupiDisponibili.map((stup) => stup.id)
      );

      setBulkSelectedRoiuri(
        roiuriDisponibile.map((roi) => roi.id)
      );
    }
  }

  function getBulkTargetIds() {
    let stupiIds = [];
    let roiuriIds = [];

    if (bulkScope === "manual") {
      if (
        bulkType === "stupi" ||
        bulkType === "ambele"
      ) {
        stupiIds = bulkSelectedStupi;
      }

      if (
        bulkType === "roiuri" ||
        bulkType === "ambele"
      ) {
        roiuriIds = bulkSelectedRoiuri;
      }
    } else {
      if (
        bulkType === "stupi" ||
        bulkType === "ambele"
      ) {
        stupiIds = getBulkAvailableStupi().map(
          (stup) => stup.id
        );
      }

      if (
        bulkType === "roiuri" ||
        bulkType === "ambele"
      ) {
        roiuriIds = getBulkAvailableRoiuri().map(
          (roi) => roi.id
        );
      }
    }

    return {
      stupiIds,
      roiuriIds,
    };
  }

  function buildBulkUpdateData() {
    const data = {};

    if (bulkFields.matca) {
      data.matca =
        bulkData.are_matca === "Nu"
          ? null
          : bulkData.matca.trim() || null;
    }

    if (bulkFields.are_matca) {
      data.are_matca =
        bulkData.are_matca === "Da"
          ? true
          : bulkData.are_matca === "Nu"
          ? false
          : null;
    }

    if (bulkFields.an_matca) {
      data.an_matca =
        bulkData.are_matca === "Nu"
          ? null
          : bulkData.an_matca !== ""
          ? Number(bulkData.an_matca)
          : null;
    }

    if (bulkFields.rame) {
      data.rame =
        bulkData.rame !== ""
          ? Number(bulkData.rame)
          : null;
    }

    if (bulkFields.rame_puiet) {
      data.rame_puiet =
        bulkData.rame_puiet !== ""
          ? Number(bulkData.rame_puiet)
          : null;
    }

    if (bulkFields.rame_miere) {
      data.rame_miere =
        bulkData.rame_miere !== ""
          ? Number(bulkData.rame_miere)
          : null;
    }

    if (bulkFields.rame_polen) {
      data.rame_polen =
        bulkData.rame_polen !== ""
          ? Number(bulkData.rame_polen)
          : null;
    }

    if (bulkFields.miere_kg) {
      data.miere_kg =
        bulkData.miere_kg !== ""
          ? Number(bulkData.miere_kg)
          : null;
    }

    if (bulkFields.status) {
      data.status = bulkData.status || null;
    }

    if (bulkFields.observatii) {
      data.observatii =
        bulkData.observatii.trim() || null;
    }

    return data;
  }

  async function applyBulkEdit() {
    const { stupiIds, roiuriIds } =
      getBulkTargetIds();

    const total =
      stupiIds.length + roiuriIds.length;

    if (total === 0) {
      alert(
        "Nu ai selectat nicio familie."
      );
      return;
    }

    const updateData =
      buildBulkUpdateData();

    if (Object.keys(updateData).length === 0) {
      alert(
        "Bifează cel puțin un câmp pe care vrei să îl modifici."
      );
      return;
    }

    const selectedFields = Object.keys(
      updateData
    ).join(", ");

    const confirmare = window.confirm(
      "⚠️ MODIFICARE ÎN MASĂ\n\n" +
        "Vor fi modificate " +
        total +
        " familii existente.\n\n" +
        "Stupi: " +
        stupiIds.length +
        "\n" +
        "Roiuri/nuclee: " +
        roiuriIds.length +
        "\n\n" +
        "Câmpuri modificate:\n" +
        selectedFields +
        "\n\n" +
        "Nu se vor crea familii noi.\n\n" +
        "Continui?"
    );

    if (!confirmare) return;

    setSavingBulkEdit(true);

    if (stupiIds.length > 0) {
      const { error } = await supabase
        .from("stupi")
        .update(updateData)
        .in("id", stupiIds);

      if (error) {
        console.error(
          "EROARE MODIFICARE MASĂ STUPI:",
          error
        );

        alert(
          "Eroare la modificarea stupilor:\n\n" +
            error.message
        );

        setSavingBulkEdit(false);
        return;
      }
    }

    if (roiuriIds.length > 0) {
      const { error } = await supabase
        .from("roiuri")
        .update(updateData)
        .in("id", roiuriIds);

      if (error) {
        console.error(
          "EROARE MODIFICARE MASĂ ROIURI:",
          error
        );

        alert(
          "Stupii au fost actualizați, dar roiurile/nucleele nu au putut fi actualizate:\n\n" +
            error.message
        );

        setSavingBulkEdit(false);
        await getData();
        return;
      }
    }

    alert(
      "Gata! Au fost modificate " +
        total +
        " familii.\n\n" +
        "Stupi: " +
        stupiIds.length +
        "\n" +
        "Roiuri/nuclee: " +
        roiuriIds.length
    );

    await getData();

    setShowBulkEdit(false);
    resetBulkEdit();
    setSavingBulkEdit(false);
  }

  /*
   * ============================================================
   * VERIFICARE
   * ============================================================
   */

  function openVerification(familie) {
    const esteStup =
      familie.tipFamilie === "Stup";

    const original =
      familie.original || familie;

    setSelectedFamilie({
      ...original,
      tipFamilie: esteStup
        ? "Stup"
        : familie.tipFamilie ||
          original.tip ||
          "Roi",
    });

    let areMatcaValue = "";

    if (original.are_matca === true) {
      areMatcaValue = "Da";
    } else if (
      original.are_matca === false
    ) {
      areMatcaValue = "Nu";
    } else if (
      original.matca &&
      original.matca !== "Da" &&
      original.matca !== "Nu"
    ) {
      areMatcaValue = "Da";
    } else if (
      original.matca === "Da"
    ) {
      areMatcaValue = "Da";
    } else if (
      original.matca === "Nu"
    ) {
      areMatcaValue = "Nu";
    }

    setVerification({
      data: new Date()
        .toISOString()
        .split("T")[0],
      matca:
        original.matca === "Da" ||
        original.matca === "Nu"
          ? ""
          : original.matca || "",
      are_matca: areMatcaValue,
      an_matca:
        original.an_matca ?? "",
      rame: original.rame ?? "",
      rame_puiet:
        original.rame_puiet ?? "",
      rame_miere:
        original.rame_miere ?? "",
      rame_polen:
        original.rame_polen ?? "",
      observatii: "",
    });

    setShowVerification(true);
  }

  async function saveVerification() {
    if (!selectedFamilie) return;

    if (!verification.data) {
      alert(
        "Completează data verificării."
      );
      return;
    }

    setSavingVerification(true);

    const esteStup =
      selectedFamilie.tipFamilie ===
      "Stup";

    const areMatca =
      verification.are_matca === "Da"
        ? true
        : verification.are_matca ===
          "Nu"
        ? false
        : null;

    const updateData = {
      matca:
        verification.matca || null,
      are_matca: areMatca,
      an_matca:
        verification.an_matca !== ""
          ? Number(
              verification.an_matca
            )
          : null,
      rame:
        verification.rame !== ""
          ? Number(
              verification.rame
            )
          : null,
      rame_puiet:
        verification.rame_puiet !== ""
          ? Number(
              verification.rame_puiet
            )
          : null,
      rame_miere:
        verification.rame_miere !== ""
          ? Number(
              verification.rame_miere
            )
          : null,
      rame_polen:
        verification.rame_polen !== ""
          ? Number(
              verification.rame_polen
            )
          : null,
      observatii:
        verification.observatii ||
        null,
    };

    const record = {
      stup_id: esteStup
        ? selectedFamilie.id
        : null,
      roi_id: esteStup
        ? null
        : selectedFamilie.id,
      data_verificare:
        verification.data,
      matca:
        verification.matca || null,
      are_matca: areMatca,
      an_matca:
        verification.an_matca !== ""
          ? Number(
              verification.an_matca
            )
          : null,
      rame:
        verification.rame !== ""
          ? Number(
              verification.rame
            )
          : null,
      rame_puiet:
        verification.rame_puiet !== ""
          ? Number(
              verification.rame_puiet
            )
          : null,
      rame_miere:
        verification.rame_miere !== ""
          ? Number(
              verification.rame_miere
            )
          : null,
      rame_polen:
        verification.rame_polen !== ""
          ? Number(
              verification.rame_polen
            )
          : null,
      observatii:
        verification.observatii ||
        null,
    };

    const { data, error } =
      await supabase
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
      setSavingVerification(false);
      return;
    }

    if (esteStup) {
      const {
        error: updateError,
      } = await supabase
        .from("stupi")
        .update(updateData)
        .eq(
          "id",
          selectedFamilie.id
        );

      if (updateError) {
        console.error(
          updateError
        );
        alert(
          "Verificarea a fost salvată, dar datele stupului nu au putut fi actualizate:\n\n" +
            updateError.message
        );
      } else {
        setStupi((prev) =>
          prev.map((stup) =>
            stup.id ===
            selectedFamilie.id
              ? {
                  ...stup,
                  ...updateData,
                }
              : stup
          )
        );
      }
    } else {
      const {
        error: updateError,
      } = await supabase
        .from("roiuri")
        .update(updateData)
        .eq(
          "id",
          selectedFamilie.id
        );

      if (updateError) {
        console.error(
          updateError
        );
        alert(
          "Verificarea a fost salvată, dar datele roiului/nucleului nu au putut fi actualizate:\n\n" +
            updateError.message
        );
      } else {
        setRoiuri((prev) =>
          prev.map((roi) =>
            roi.id ===
            selectedFamilie.id
              ? {
                  ...roi,
                  ...updateData,
                }
              : roi
          )
        );
      }
    }

    setVerificari((prev) => [
      data,
      ...prev,
    ]);

    setShowVerification(false);

    const numeFamilie =
      esteStup
        ? "Stupul " +
          selectedFamilie.numar_stup
        : (selectedFamilie.tip ||
            selectedFamilie.tipFamilie) +
          " " +
          selectedFamilie.numar;

    alert(
      "Verificarea pentru " +
        numeFamilie +
        " a fost salvată!"
    );

    setSavingVerification(false);
  }

  /*
   * ============================================================
   * STUPINE
   * ============================================================
   */

  async function addStupToStupina() {
    if (
      !selectedFamilie ||
      !selectedStupina
    ) {
      alert("Alege stupina.");
      return;
    }

    const stupinaAleasa =
      stupine.find(
        (stupina) =>
          String(stupina.id) ===
          String(selectedStupina)
      );

    if (!stupinaAleasa) {
      alert(
        "Stupina selectată nu a fost găsită."
      );
      return;
    }

    setSavingStupina(true);

    const { error } =
      await supabase
        .from("stupi")
        .update({
          stupina_id:
            stupinaAleasa.id,
        })
        .eq(
          "id",
          selectedFamilie.id
        );

    if (error) {
      console.error(error);

      alert(
        "Eroare la asocierea stupului cu stupina:\n\n" +
          error.message
      );

      setSavingStupina(false);
      return;
    }

    setStupi((prev) =>
      prev.map((stup) =>
        stup.id ===
        selectedFamilie.id
          ? {
              ...stup,
              stupina_id:
                stupinaAleasa.id,
            }
          : stup
      )
    );

    setShowAddToStupina(false);
    setSelectedStupina("");
    setSavingStupina(false);

    alert(
      "Stupul " +
        selectedFamilie.numar_stup +
        " a fost asociat cu stupina „" +
        stupinaAleasa.nume +
        "”."
    );
  }

  async function removeStupFromStupina(
    stup
  ) {
    if (!stup) return;

    const stupinaActuala =
      stupine.find(
        (stupina) =>
          String(stupina.id) ===
          String(stup.stupina_id)
      );

    const confirmare =
      window.confirm(
        "Vrei să scoți stupul " +
          stup.numar_stup +
          " din stupina „" +
          (stupinaActuala?.nume ||
            "actuală") +
          "”?\n\nStupul nu va fi șters. Va rămâne în tabelul principal fără stupină."
      );

    if (!confirmare) return;

    const { error } =
      await supabase
        .from("stupi")
        .update({
          stupina_id: null,
        })
        .eq("id", stup.id);

    if (error) {
      console.error(error);

      alert(
        "Eroare la scoaterea stupului din stupină:\n\n" +
          error.message
      );

      return;
    }

    setStupi((prev) =>
      prev.map((item) =>
        item.id === stup.id
          ? {
              ...item,
              stupina_id: null,
            }
          : item
      )
    );

    alert(
      "Stupul " +
        stup.numar_stup +
        " a fost scos din stupină."
    );
  }

  /*
   * ============================================================
   * ADAUGARE STUP
   * ============================================================
   */

  async function addStup() {
    const number =
      newStupNumber.trim();

    if (!number) {
      alert(
        "Introdu numărul stupului."
      );
      return;
    }

    const numericNumber =
      Number(number);

    if (
      !Number.isInteger(
        numericNumber
      ) ||
      numericNumber <= 0
    ) {
      alert(
        "Numărul stupului trebuie să fie un număr întreg pozitiv."
      );
      return;
    }

    const alreadyExists =
      stupi.some(
        (stup) =>
          Number(
            stup.numar_stup
          ) === numericNumber
      );

    if (alreadyExists) {
      alert(
        "Există deja un stup cu numărul " +
          numericNumber +
          "."
      );
      return;
    }

    setSavingStup(true);

    const { data, error } =
      await supabase
        .from("stupi")
        .insert({
          numar_stup:
            numericNumber,
          matca: null,
          are_matca: null,
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
            Number(
              a.numar_stup
            ) -
            Number(
              b.numar_stup
            )
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

  /*
   * ============================================================
   * ADAUGARE MAI MULȚI STUPI
   * ============================================================
   */

  async function addMultipleStupi() {
    const count =
      Number(multipleStupiCount);

    if (
      !Number.isInteger(count) ||
      count <= 0
    ) {
      alert(
        "Introdu un număr întreg mai mare decât 0."
      );
      return;
    }

    if (count > 1000) {
      alert(
        "Poți adăuga maximum 1000 de stupi odată."
      );
      return;
    }

    const maxNumber =
      stupi.reduce(
        (max, stup) =>
          Math.max(
            max,
            Number(
              stup.numar_stup
            ) || 0
          ),
        0
      );

    const primulNumar =
      maxNumber + 1;

    const ultimulNumar =
      maxNumber + count;

    const confirmare =
      window.confirm(
        "Vrei să adaugi " +
          count +
          " familii noi?\n\n" +
          "Vor fi creați stupii " +
          primulNumar +
          " – " +
          ultimulNumar +
          "."
      );

    if (!confirmare) return;

    setSavingMultiple(true);

    const stupiNoi =
      Array.from(
        { length: count },
        (_, index) => ({
          numar_stup:
            primulNumar +
            index,
          matca: null,
          are_matca: null,
          an_matca: null,
          rame: null,
          rame_puiet: null,
          rame_miere: null,
          rame_polen: null,
          miere_kg: 0,
          status: "Activ",
          observatii: null,
        })
      );

    const { data, error } =
      await supabase
        .from("stupi")
        .insert(stupiNoi)
        .select();

    if (error) {
      console.error(error);
      alert(
        "Eroare la adăugarea stupilor:\n\n" +
          error.message
      );
      setSavingMultiple(false);
      return;
    }

    setStupi((prev) =>
      [
        ...prev,
        ...(data || []),
      ].sort(
        (a, b) =>
          Number(
            a.numar_stup
          ) -
          Number(
            b.numar_stup
          )
      )
    );

    setMultipleStupiCount("");
    setShowAddMultiple(false);
    setSavingMultiple(false);

    alert(
      "Au fost adăugate cu succes " +
        count +
        " familii noi!\n\n" +
        "Stupii " +
        primulNumar +
        " – " +
        ultimulNumar
    );
  }

  /*
   * ============================================================
   * ȘTERGERE STUP
   * ============================================================
   */

  async function deleteStup(stup) {
    if (!stup || !stup.id)
      return;

    const confirmare =
      window.confirm(
        "⚠️ ATENȚIE!\n\n" +
          "Sigur vrei să ștergi STUPUL " +
          stup.numar_stup +
          "?\n\n" +
          "Vor fi șterse și verificările și tratamentele asociate acestui stup.\n\n" +
          "Această acțiune NU poate fi anulată."
      );

    if (!confirmare) return;

    setDeletingStup(stup.id);

    const {
      error: tratamenteError,
    } = await supabase
      .from("tratamente")
      .delete()
      .eq(
        "stup_id",
        stup.id
      );

    if (tratamenteError) {
      console.error(
        tratamenteError
      );
      alert(
        "Stupul nu a fost șters deoarece nu au putut fi șterse tratamentele asociate:\n\n" +
          tratamenteError.message
      );
      setDeletingStup(null);
      return;
    }

    const {
      error: verificariError,
    } = await supabase
      .from("verificari")
      .delete()
      .eq(
        "stup_id",
        stup.id
      );

    if (verificariError) {
      console.error(
        verificariError
      );
      alert(
        "Stupul nu a fost șters deoarece nu au putut fi șterse verificările asociate:\n\n" +
          verificariError.message
      );
      setDeletingStup(null);
      return;
    }

    const { error: stupError } =
      await supabase
        .from("stupi")
        .delete()
        .eq("id", stup.id);

    if (stupError) {
      console.error(
        stupError
      );
      alert(
        "Eroare la ștergerea stupului:\n\n" +
          stupError.message
      );
      setDeletingStup(null);
      return;
    }

    setStupi((prev) =>
      prev.filter(
        (item) =>
          item.id !== stup.id
      )
    );

    setTratamente((prev) =>
      prev.filter(
        (tratament) =>
          tratament.stup_id !==
          stup.id
      )
    );

    setVerificari((prev) =>
      prev.filter(
        (verificare) =>
          verificare.stup_id !==
          stup.id
      )
    );

    alert(
      "Stupul " +
        stup.numar_stup +
        " a fost șters cu succes."
    );

    setDeletingStup(null);
  }

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  async function updateStupStatus(
    stupId,
    status
  ) {
    const { error } =
      await supabase
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

  async function updateRoiStatus(
    roiId,
    status
  ) {
    const { error } =
      await supabase
        .from("roiuri")
        .update({ status })
        .eq("id", roiId);

    if (error) {
      console.error(error);
      alert(
        "Eroare la schimbarea statusului roiului/nucleului: " +
          error.message
      );
      return;
    }

    setRoiuri((prev) =>
      prev.map((roi) =>
        roi.id === roiId
          ? { ...roi, status }
          : roi
      )
    );
  }

  async function updateAllStatuses(
    status
  ) {
    const totalFamilii =
      stupi.length +
      roiuri.length;

    const confirmare =
      window.confirm(
        "Sigur vrei să setezi toate cele " +
          totalFamilii +
          " familii ca „" +
          status +
          "”?\n\n" +
          "Stupi: " +
          stupi.length +
          "\n" +
          "Roiuri / nuclee: " +
          roiuri.length
      );

    if (!confirmare) return;

    const {
      error: stupiError,
    } = await supabase
      .from("stupi")
      .update({ status })
      .not(
        "id",
        "is",
        null
      );

    if (stupiError) {
      console.error(
        stupiError
      );
      alert(
        "Eroare la schimbarea statusurilor stupilor: " +
          stupiError.message
      );
      return;
    }

    const {
      error: roiuriError,
    } = await supabase
      .from("roiuri")
      .update({ status })
      .not(
        "id",
        "is",
        null
      );

    if (roiuriError) {
      console.error(
        roiuriError
      );
      alert(
        "Stupii au fost actualizați, dar roiurile/nucleele nu au putut fi actualizate.\n\n" +
          roiuriError.message
      );
    }

    setStupi((prev) =>
      prev.map((stup) => ({
        ...stup,
        status,
      }))
    );

    if (!roiuriError) {
      setRoiuri((prev) =>
        prev.map((roi) => ({
          ...roi,
          status,
        }))
      );
    }

    alert(
      "Statusurile au fost actualizate pentru toate familiile."
    );
  }

  /*
   * ============================================================
   * TRATAMENTE
   * ============================================================
   */

  async function applyTreatmentToAll() {
    if (
      !treatment.tip ||
      !treatment.data
    ) {
      alert(
        "Completează tratamentul și data."
      );
      return;
    }

    const totalFamilii =
      stupi.length +
      roiuri.length;

    const confirmare =
      window.confirm(
        'Ești sigur că vrei să adaugi tratamentul "' +
          treatment.tip +
          '" pentru toate cele ' +
          totalFamilii +
          " familii?\n\n" +
          "Stupi: " +
          stupi.length +
          "\n" +
          "Roiuri / nuclee: " +
          roiuri.length
      );

    if (!confirmare) return;

    setSavingTreatment(true);

    const stupiRecords =
      stupi.map((stup) => ({
        stup_id: stup.id,
        roi_id: null,
        tip: treatment.tip,
        data_tratament:
          treatment.data,
        detalii:
          treatment.detalii ||
          null,
      }));

    const roiuriRecords =
      roiuri.map((roi) => ({
        stup_id: null,
        roi_id: roi.id,
        tip: treatment.tip,
        data_tratament:
          treatment.data,
        detalii:
          treatment.detalii ||
          null,
      }));

    const records = [
      ...stupiRecords,
      ...roiuriRecords,
    ];

    if (records.length === 0) {
      alert(
        "Nu există nicio familie înregistrată."
      );
      setSavingTreatment(false);
      return;
    }

    const { data, error } =
      await supabase
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
        "Tratamentul a fost adăugat pentru toate cele " +
          totalFamilii +
          " familii!\n\n" +
          stupi.length +
          " stupi + " +
          roiuri.length +
          " roiuri/nuclee."
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

  async function deleteTreatmentBatch(
    batch
  ) {
    const confirmare =
      window.confirm(
        "Sigur vrei să ștergi tratamentul " +
          batch.tip +
          " din " +
          batch.data_tratament +
          " pentru cele " +
          batch.count +
          " familii?\n\nDetalii: " +
          (batch.detalii ||
            "Fără detalii")
      );

    if (!confirmare) return;

    setDeletingBatch(batch.key);

    let query = supabase
      .from("tratamente")
      .delete()
      .eq(
        "tip",
        batch.tip
      )
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

    const { error } =
      await query;

    if (error) {
      console.error(error);
      alert(
        "Eroare la ștergere: " +
          error.message
      );
    } else {
      setTratamente((prev) =>
        prev.filter(
          (tratament) => {
            const sameTip =
              tratament.tip ===
              batch.tip;

            const sameDate =
              tratament.data_tratament ===
              batch.data_tratament;

            const sameDetails =
              (tratament.detalii ||
                "") ===
              (batch.detalii ||
                "");

            return !(
              sameTip &&
              sameDate &&
              sameDetails
            );
          }
        )
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
        <p>
          Se încarcă stupina...
        </p>
      </main>
    );
  }

  const totalFamilii =
    stupi.length +
    roiuri.length;

  const totalMiere =
    stupi.reduce(
      (total, stup) =>
        total +
        Number(
          stup.miere_kg || 0
        ),
      0
    ) +
    roiuri.reduce(
      (total, roi) =>
        total +
        Number(
          roi.miere_kg || 0
        ),
      0
    );

  const totalPuiet =
    stupi.reduce(
      (total, stup) =>
        total +
        Number(
          stup.rame_puiet || 0
        ),
      0
    ) +
    roiuri.reduce(
      (total, roi) =>
        total +
        Number(
          roi.rame_puiet || 0
        ),
      0
    );

  const totalRameMiere =
    stupi.reduce(
      (total, stup) =>
        total +
        Number(
          stup.rame_miere || 0
        ),
      0
    ) +
    roiuri.reduce(
      (total, roi) =>
        total +
        Number(
          roi.rame_miere || 0
        ),
      0
    );

  const totalRamePolen =
    stupi.reduce(
      (total, stup) =>
        total +
        Number(
          stup.rame_polen || 0
        ),
      0
    ) +
    roiuri.reduce(
      (total, roi) =>
        total +
        Number(
          roi.rame_polen || 0
        ),
      0
    );

  const cuMatca =
    stupi.filter(
      (stup) =>
        stup.are_matca ===
          true ||
        (stup.are_matca ==
          null &&
          stup.matca &&
          stup.matca !== "Nu")
    ).length +
    roiuri.filter(
      (roi) =>
        roi.are_matca ===
          true ||
        (roi.are_matca ==
          null &&
          roi.matca &&
          roi.matca !== "Nu")
    ).length;

  const faraMatca =
    totalFamilii -
    cuMatca;

  const alerteStupi =
    stupi.filter(
      (stup) =>
        stup.are_matca ===
          false ||
        (stup.are_matca ==
          null &&
          !stup.matca) ||
        Number(
          stup.rame_puiet || 0
        ) === 0
    );

  const alerteRoiuri =
    roiuri.filter(
      (roi) =>
        roi.are_matca ===
          false ||
        (roi.are_matca ==
          null &&
          !roi.matca) ||
        Number(
          roi.rame_puiet || 0
        ) === 0
    );

  const alerte = [
    ...alerteStupi.map(
      (stup) => ({
        tipFamilie: "stup",
        id: stup.id,
        numar:
          stup.numar_stup,
        matca: stup.matca,
        are_matca:
          stup.are_matca,
        rame_puiet:
          stup.rame_puiet,
      })
    ),
    ...alerteRoiuri.map(
      (roi) => ({
        tipFamilie: "roi",
        id: roi.id,
        numar: roi.numar,
        tip: roi.tip,
        matca: roi.matca,
        are_matca:
          roi.are_matca,
        rame_puiet:
          roi.rame_puiet,
      })
    ),
  ];

  const stupiActivi =
    stupi.filter(
      (stup) =>
        stup.status === "Activ"
    ).length;

  const stupiInactivi =
    stupi.filter(
      (stup) =>
        stup.status ===
        "Inactiv"
    ).length;

  const roiuriActive =
    roiuri.filter(
      (roi) =>
        roi.status === "Activ"
    ).length;

  const roiuriInactive =
    roiuri.filter(
      (roi) =>
        roi.status ===
        "Inactiv"
    ).length;

  const familiiActive =
    stupiActivi +
    roiuriActive;

  const familiiInactive =
    stupiInactivi +
    roiuriInactive;

  const familiiFaraStatus =
    totalFamilii -
    familiiActive -
    familiiInactive;

  const searchTerm =
    search
      .trim()
      .toLowerCase();

  const filteredStupi =
    stupi.filter((stup) =>
      String(
        stup.numar_stup
      )
        .toLowerCase()
        .includes(searchTerm)
    );

  const filteredRoiuri =
    roiuri.filter((roi) =>
      String(roi.numar)
        .toLowerCase()
        .includes(searchTerm)
    );

  const hasSearch =
    searchTerm.length > 0;

  const familiiTabel = [
    ...filteredStupi.map(
      (stup) => ({
        tipFamilie: "Stup",
        id: stup.id,
        numar:
          stup.numar_stup,
        matca: stup.matca,
        are_matca:
          stup.are_matca,
        an_matca:
          stup.an_matca,
        rame: stup.rame,
        rame_puiet:
          stup.rame_puiet,
        rame_miere:
          stup.rame_miere,
        rame_polen:
          stup.rame_polen,
        miere_kg:
          stup.miere_kg,
        status: stup.status,
        observatii:
          stup.observatii,
        stupina_id:
          stup.stupina_id,
        original: stup,
      })
    ),

    ...filteredRoiuri.map(
      (roi) => ({
        tipFamilie:
          roi.tip === "Nucleu"
            ? "Nucleu"
            : "Roi",
        id: roi.id,
        numar: roi.numar,
        matca: roi.matca,
        are_matca:
          roi.are_matca,
        an_matca:
          roi.an_matca,
        rame: roi.rame,
        rame_puiet:
          roi.rame_puiet,
        rame_miere:
          roi.rame_miere,
        rame_polen:
          roi.rame_polen,
        miere_kg:
          roi.miere_kg,
        status: roi.status,
        observatii:
          roi.observatii,
        origine:
          roi.origine,
        tip: roi.tip,
        original: roi,
      })
    ),
  ].sort((a, b) =>
    String(a.numar).localeCompare(
      String(b.numar),
      undefined,
      {
        numeric: true,
      }
    )
  );

  const batchesMap = {};

  tratamente.forEach(
    (tratament) => {
      const key =
        tratament.tip +
        "|" +
        tratament.data_tratament +
        "|" +
        (tratament.detalii ||
          "");

      if (!batchesMap[key]) {
        batchesMap[key] = {
          key,
          tip: tratament.tip,
          data_tratament:
            tratament.data_tratament,
          detalii:
            tratament.detalii ||
            "",
          count: 0,
        };
      }

      batchesMap[key].count++;
    }
  );

  const treatmentBatches =
    Object.values(
      batchesMap
    );

  const maxStupNumber =
    stupi.reduce(
      (max, stup) =>
        Math.max(
          max,
          Number(
            stup.numar_stup
          ) || 0
        ),
      0
    );

  const nextStupNumber =
    maxStupNumber + 1;

  const multipleCountNumber =
    Number(
      multipleStupiCount
    );

  const multipleLastNumber =
    multipleCountNumber > 0
      ? nextStupNumber +
        multipleCountNumber -
        1
      : nextStupNumber;

  const bulkCounts =
    getSelectedBulkCounts();

  const bulkStupiList =
    getBulkAvailableStupi();

  const bulkRoiuriList =
    getBulkAvailableRoiuri();

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
          {totalFamilii} familii
        </div>
      </header>

      <section style={styles.statsGrid}>
        <StatCard
          icon="🐝"
          title="Total familii"
          value={totalFamilii}
        />

        <StatCard
          icon="🟢"
          title="Familii active"
          value={familiiActive}
        />

        <StatCard
          icon="🔴"
          title="Familii inactive"
          value={familiiInactive}
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
        <section
          style={styles.alertSection}
        >
          <div
            style={styles.alertTitle}
          >
            🚨 Atenție
          </div>

          <p
            style={styles.alertText}
          >
            Sunt {alerte.length} familii care necesită atenție.
          </p>

          <div
            style={styles.alertList}
          >
            {alerte
              .slice(0, 12)
              .map(
                (familie) => {
                  if (
                    familie.tipFamilie ===
                    "stup"
                  ) {
                    return (
                      <Link
                        key={
                          "alert-stup-" +
                          familie.id
                        }
                        href={
                          "/stupi/" +
                          familie.numar
                        }
                        style={
                          styles.alertItem
                        }
                      >
                        Stup{" "}
                        {familie.numar}
                        {familie.are_matca ===
                        false
                          ? " — fără matcă"
                          : Number(
                              familie.rame_puiet ||
                                0
                            ) === 0
                          ? " — fără puiet"
                          : ""}
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={
                        "alert-roi-" +
                        familie.id
                      }
                      href="/roiuri"
                      style={
                        styles.alertRoiItem
                      }
                    >
                      {familie.tip}{" "}
                      {familie.numar}
                      {familie.are_matca ===
                      false
                        ? " — fără matcă"
                        : Number(
                            familie.rame_puiet ||
                              0
                          ) === 0
                        ? " — fără puiet"
                        : ""}
                    </Link>
                  );
                }
              )}
          </div>

          {alerte.length >
            12 && (
            <p
              style={
                styles.moreAlert
              }
            >
              + încă{" "}
              {alerte.length - 12}{" "}
              familii
            </p>
          )}
        </section>
      )}

      <section
        style={styles.searchSection}
      >
        <div
          style={styles.searchTitle}
        >
          🔍 Caută în stupină
        </div>

        <input
          style={styles.searchInput}
          type="text"
          placeholder="Ex: 25, 1234, R1, R15..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        {hasSearch && (
          <div
            style={
              styles.searchResults
            }
          >
            {filteredStupi.length ===
              0 &&
            filteredRoiuri.length ===
              0 ? (
              <div
                style={
                  styles.noSearchResults
                }
              >
                Nu am găsit niciun stup, roi sau nucleu pentru „
                {search}”.
              </div>
            ) : (
              <>
                {filteredStupi.length >
                  0 && (
                  <div
                    style={
                      styles.searchGroup
                    }
                  >
                    <div
                      style={
                        styles.searchGroupTitle
                      }
                    >
                      🐝 Stupi
                    </div>

                    <div
                      style={
                        styles.searchItems
                      }
                    >
                      {filteredStupi.map(
                        (stup) => (
                          <Link
                            key={
                              "stup-" +
                              stup.id
                            }
                            href={
                              "/stupi/" +
                              stup.numar_stup
                            }
                            style={
                              styles.searchStupItem
                            }
                          >
                            <div>
                              <strong>
                                Stupul{" "}
                                {
                                  stup.numar_stup
                                }
                              </strong>

                              <div
                                style={
                                  styles.searchItemDetails
                                }
                              >
                                {stup.are_matca
                                  ? "👑 Cu matcă"
                                  : "⚠️ Fără matcă"}
                                {" • "}
                                {stup.status ||
                                  "Fără status"}
                              </div>
                            </div>

                            <span>
                              →
                            </span>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}

                {filteredRoiuri.length >
                  0 && (
                  <div
                    style={
                      styles.searchGroup
                    }
                  >
                    <div
                      style={
                        styles.searchGroupTitle
                      }
                    >
                      🐝 Roiuri / Nuclee
                    </div>

                    <div
                      style={
                        styles.searchItems
                      }
                    >
                      {filteredRoiuri.map(
                        (roi) => (
                          <Link
                            key={
                              "roi-" +
                              roi.id
                            }
                            href="/roiuri"
                            style={
                              styles.searchRoiItem
                            }
                          >
                            <div>
                              <strong>
                                {roi.tip}{" "}
                                {roi.numar}
                              </strong>

                              <div
                                style={
                                  styles.searchItemDetails
                                }
                              >
                                {roi.are_matca
                                  ? "👑 Cu matcă"
                                  : "⚠️ Fără matcă"}
                                {" • "}
                                {roi.status ||
                                  "Fără status"}
                                {roi.origine
                                  ? " • Origine: " +
                                    roi.origine
                                  : ""}
                              </div>
                            </div>

                            <span>
                              →
                            </span>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <section
        style={styles.actionsSection}
      >
        <button
          style={styles.addStupButton}
          onClick={() =>
            setShowAddStup(true)
          }
        >
          ➕ Adaugă stup
        </button>

        <Link
          href="/stupine"
          style={styles.stupineButton}
        >
          📍 Stupine
        </Link>

        <button
          style={
            styles.addMultipleButton
          }
          onClick={() =>
            setShowAddMultiple(
              true
            )
          }
        >
          ➕ Adaugă mai mulți stupi
        </button>

        <button
          style={
            styles.bulkEditButton
          }
          onClick={() => {
            resetBulkEdit();
            setShowBulkEdit(true);
          }}
        >
          ✏️ Modifică în masă
        </button>

        <Link
          href="/statistici"
          style={styles.statsButton}
        >
          📊 Statistici complete
        </Link>

        <button
          style={
            styles.treatmentButton
          }
          onClick={() =>
            setShowTreatment(true)
          }
        >
          💊 Tratamente pentru toate familiile
        </button>

        <Link
          href="/tratamente"
          style={
            styles.historyButton
          }
        >
          📜 Istoric tratamente
        </Link>

        <Link
          href="/roiuri"
          style={
            styles.historyButton
          }
        >
          🐝 Roiuri / Nuclee
        </Link>
      </section>

      <section
        style={styles.statusSection}
      >
        <div
          style={styles.statusHeader}
        >
          <div>
            <h2
              style={styles.statusTitle}
            >
              🔄 Status familii
            </h2>

            <p
              style={
                styles.statusSubtitle
              }
            >
              Poți schimba statusul fiecărei familii separat sau al tuturor deodată.
            </p>
          </div>

          <div
            style={styles.statusActions}
          >
            <button
              style={
                styles.activateAllButton
              }
              onClick={() =>
                updateAllStatuses(
                  "Activ"
                )
              }
            >
              🟢 Toți activi
            </button>

            <button
              style={
                styles.deactivateAllButton
              }
              onClick={() =>
                updateAllStatuses(
                  "Inactiv"
                )
              }
            >
              🔴 Toți inactivi
            </button>
          </div>
        </div>

        <div
          style={styles.statusSummary}
        >
          <span
            style={
              styles.activeSummary
            }
          >
            🟢 {familiiActive} familii active
          </span>

          <span
            style={
              styles.inactiveSummary
            }
          >
            🔴 {familiiInactive} familii inactive
          </span>

          <span
            style={
              styles.noStatusSummary
            }
          >
            ⚪ {familiiFaraStatus} fără status
          </span>
        </div>
      </section>

      <section
        style={styles.batchSection}
      >
        <div
          style={styles.batchHeader}
        >
          <h2
            style={styles.batchTitle}
          >
            📜 Tratamente înregistrate
          </h2>

          <p
            style={styles.batchSubtitle}
          >
            Istoricul include tratamentele aplicate atât stupilor, cât și roiurilor/nucleelor.
          </p>
        </div>

        {treatmentBatches.length ===
        0 ? (
          <div
            style={
              styles.emptyBatches
            }
          >
            Nu există tratamente înregistrate.
          </div>
        ) : (
          <div
            style={styles.batchList}
          >
            {treatmentBatches.map(
              (batch) => (
                <div
                  key={batch.key}
                  style={
                    styles.batchItem
                  }
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
                      {
                        batch.data_tratament
                      }
                      {" • "}
                      🐝 {batch.count}{" "}
                      {batch.count ===
                      1
                        ? "familie"
                        : "familii"}
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

      <section
        style={styles.mainTableSection}
      >
        <div
          style={
            styles.mainTableHeader
          }
        >
          <div>
            <h2
              style={
                styles.mainTableTitle
              }
            >
              🐝 Toate familiile din stupină
            </h2>

            <p
              style={
                styles.mainTableSubtitle
              }
            >
              Stupii, roiurile și nucleele sunt afișate împreună.
            </p>
          </div>

          <div
            style={
              styles.tableFamilyCount
            }
          >
            {familiiTabel.length} afișate
          </div>
        </div>

        <div
          style={styles.tableWrapper}
        >
          <table
            style={styles.table}
          >
            <thead>
              <tr>
                <th style={styles.th}>
                  Tip
                </th>
                <th style={styles.th}>
                  Nr.
                </th>
                <th style={styles.th}>
                  Stupină
                </th>
                <th style={styles.th}>
                  Rasa matcă
                </th>
                <th style={styles.th}>
                  Are matcă?
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
                  Origine
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
              {familiiTabel.map(
                (familie) => {
                  const esteStup =
                    familie.tipFamilie ===
                    "Stup";

                  const stupinaFamilie =
                    esteStup
                      ? stupine.find(
                          (stupina) =>
                            String(
                              stupina.id
                            ) ===
                            String(
                              familie.stupina_id
                            )
                        )
                      : null;

                  return (
                    <tr
                      key={
                        (esteStup
                          ? "stup-"
                          : "roi-") +
                        familie.id
                      }
                      style={styles.row}
                    >
                      <td
                        style={
                          styles.td
                        }
                      >
                        <span
                          style={
                            esteStup
                              ? styles.familyStupBadge
                              : familie.tipFamilie ===
                                "Nucleu"
                              ? styles.familyNucleuBadge
                              : styles.familyRoiBadge
                          }
                        >
                          {esteStup
                            ? "🐝 Stup"
                            : familie.tipFamilie ===
                              "Nucleu"
                            ? "🔵 Nucleu"
                            : "🟡 Roi"}
                        </span>
                      </td>

                      <td
                        style={
                          styles.tdNumber
                        }
                      >
                        {esteStup ? (
                          <Link
                            href={
                              "/stupi/" +
                              familie.numar
                            }
                            style={
                              styles.stupLink
                            }
                          >
                            Stupul{" "}
                            {
                              familie.numar
                            }
                          </Link>
                        ) : (
                          <Link
                            href="/roiuri"
                            style={
                              styles.roiLink
                            }
                          >
                            {
                              familie.numar
                            }
                          </Link>
                        )}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {stupinaFamilie ? (
                          <div>
                            <strong>
                              📍{" "}
                              {
                                stupinaFamilie.nume
                              }
                            </strong>

                            {stupinaFamilie.locatie && (
                              <div
                                style={
                                  styles.stupinaLocation
                                }
                              >
                                {
                                  stupinaFamilie.locatie
                                }
                              </div>
                            )}
                          </div>
                        ) : esteStup ? (
                          <span
                            style={
                              styles.noStupina
                            }
                          >
                            Fără stupină
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.matca &&
                        familie.matca !==
                          "Da" &&
                        familie.matca !==
                          "Nu"
                          ? familie.matca
                          : "—"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.are_matca ===
                        true ? (
                          <span
                            style={
                              styles.queenYes
                            }
                          >
                            👑 Da
                          </span>
                        ) : familie.are_matca ===
                          false ? (
                          <span
                            style={
                              styles.queenNo
                            }
                          >
                            ❌ Nu
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.an_matca ||
                          "—"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.rame ??
                          "—"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.rame_puiet ??
                          "—"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.miere_kg
                          ? familie.miere_kg +
                            " kg"
                          : "—"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.rame_polen ??
                          "—"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        <select
                          value={
                            familie.status ||
                            ""
                          }
                          onChange={(
                            e
                          ) => {
                            if (
                              esteStup
                            ) {
                              updateStupStatus(
                                familie.id,
                                e
                                  .target
                                  .value
                              );
                            } else {
                              updateRoiStatus(
                                familie.id,
                                e
                                  .target
                                  .value
                              );
                            }
                          }}
                          style={{
                            ...styles.statusSelect,
                            ...(familie.status ===
                            "Activ"
                              ? styles.statusSelectActive
                              : {}),
                            ...(familie.status ===
                            "Inactiv"
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

                          {!esteStup && (
                            <>
                              <option value="Vândut">
                                Vândut
                              </option>

                              <option value="Unit">
                                Unit
                              </option>

                              <option value="Pierdut">
                                Pierdut
                              </option>
                            </>
                          )}
                        </select>
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.origine ||
                          "—"}
                      </td>

                      <td
                        style={
                          styles.td
                        }
                      >
                        {familie.observatii ||
                          "—"}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          ...styles.actionCell,
                        }}
                      >
                        <div
                          style={
                            styles.actionButtons
                          }
                        >
                          <button
                            style={
                              styles.verifyButton
                            }
                            onClick={() =>
                              openVerification(
                                familie
                              )
                            }
                          >
                            📝 Verifică
                          </button>

                          {esteStup && (
                            <>
                              <button
                                style={
                                  styles.stupinaActionButton
                                }
                                onClick={() => {
                                  setSelectedFamilie(
                                    familie.original
                                  );

                                  setSelectedStupina(
                                    familie
                                      .original
                                      .stupina_id
                                      ? String(
                                          familie
                                            .original
                                            .stupina_id
                                        )
                                      : ""
                                  );

                                  setShowAddToStupina(
                                    true
                                  );
                                }}
                              >
                                {familie
                                  .original
                                  .stupina_id
                                  ? "🔄 Schimbă stupina"
                                  : "📍 Adaugă la stupină"}
                              </button>

                              {familie
                                .original
                                .stupina_id && (
                                <button
                                  style={
                                    styles.removeStupinaButton
                                  }
                                  onClick={() =>
                                    removeStupFromStupina(
                                      familie.original
                                    )
                                  }
                                >
                                  ❌ Scoate din stupină
                                </button>
                              )}

                              <button
                                style={
                                  styles.deleteStupButton
                                }
                                onClick={() =>
                                  deleteStup(
                                    familie.original
                                  )
                                }
                                disabled={
                                  deletingStup ===
                                  familie.id
                                }
                              >
                                {deletingStup ===
                                familie.id
                                  ? "Se șterge..."
                                  : "🗑️ Șterge"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {familiiTabel.length ===
          0 && (
          <div
            style={styles.noResults}
          >
            {hasSearch
              ? "Nu există familii care corespund căutării."
              : "Nu există familii înregistrate."}
          </div>
        )}
      </section>

      {/* ======================================================
          MODAL MODIFICARE ÎN MASĂ
         ====================================================== */}

      {showBulkEdit && (
        <div
          style={styles.overlay}
        >
          <div
            style={
              styles.bulkModal
            }
          >
            <button
              style={
                styles.closeButton
              }
              onClick={
                closeBulkEdit
              }
            >
              ×
            </button>

            <h2
              style={
                styles.modalTitle
              }
            >
              ✏️ Modifică în masă
            </h2>

            <p
              style={
                styles.modalDescription
              }
            >
              Modifică datele mai multor familii existente dintr-o singură operație.
            </p>

            <div
              style={
                styles.bulkInfoBox
              }
            >
              ⚠️ <strong>Important:</strong>{" "}
              nu se creează familii noi. Sunt modificate doar înregistrările deja existente.
            </div>

            <label
              style={
                styles.label
              }
            >
              1. Ce vrei să modifici?
            </label>

            <select
              style={
                styles.input
              }
              value={bulkType}
              onChange={(e) => {
                setBulkType(
                  e.target.value
                );
                setBulkSelectedStupi(
                  []
                );
                setBulkSelectedRoiuri(
                  []
                );
              }}
            >
              <option value="stupi">
                🐝 Stupi
              </option>

              <option value="roiuri">
                🐝 Roiuri / Nuclee
              </option>

              <option value="ambele">
                🐝 Stupi + Roiuri / Nuclee
              </option>
            </select>

            <label
              style={
                styles.label
              }
            >
              2. Pe cine aplicăm?
            </label>

            <select
              style={
                styles.input
              }
              value={bulkScope}
              onChange={(e) => {
                setBulkScope(
                  e.target.value
                );
                setBulkSelectedStupi(
                  []
                );
                setBulkSelectedRoiuri(
                  []
                );
              }}
            >
              <option value="toate">
                🌍 Toate din baza de date
              </option>

              <option value="stupina">
                📍 O anumită stupină
              </option>

              <option value="manual">
                ☑️ Selectare manuală
              </option>
            </select>

            {bulkScope ===
              "stupina" && (
              <>
                <label
                  style={
                    styles.label
                  }
                >
                  Alege stupina
                </label>

                <select
                  style={
                    styles.input
                  }
                  value={
                    bulkStupinaId
                  }
                  onChange={(e) =>
                    setBulkStupinaId(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Selectează stupina
                  </option>

                  {stupine.map(
                    (stupina) => (
                      <option
                        key={
                          stupina.id
                        }
                        value={
                          stupina.id
                        }
                      >
                        {stupina.nume}
                        {stupina.locatie
                          ? " — " +
                            stupina.locatie
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </>
            )}

            <div
              style={
                styles.bulkSelectedSummary
              }
            >
              <strong>
                Se vor modifica:
              </strong>

              <span>
                🐝 Stupi:{" "}
                {bulkCounts.stupi}
              </span>

              <span>
                🐝 Roiuri/nuclee:{" "}
                {bulkCounts.roiuri}
              </span>

              <strong>
                Total:{" "}
                {bulkCounts.total}
              </strong>
            </div>

            {bulkScope ===
              "manual" && (
              <div
                style={
                  styles.manualSelection
                }
              >
                {(bulkType ===
                  "stupi" ||
                  bulkType ===
                    "ambele") && (
                  <div
                    style={
                      styles.bulkListSection
                    }
                  >
                    <div
                      style={
                        styles.bulkListHeader
                      }
                    >
                      <strong>
                        🐝 Stupi
                      </strong>

                      <button
                        style={
                          styles.selectAllButton
                        }
                        onClick={
                          selectAllBulkStupi
                        }
                      >
                        Selectează /
                        deselectează
                        toți
                      </button>
                    </div>

                    <div
                      style={
                        styles.bulkChecklist
                      }
                    >
                      {bulkStupiList.length ===
                      0 ? (
                        <div
                          style={
                            styles.emptyBulk
                          }
                        >
                          Nu există stupi.
                        </div>
                      ) : (
                        bulkStupiList.map(
                          (stup) => (
                            <label
                              key={
                                stup.id
                              }
                              style={
                                styles.checkboxRow
                              }
                            >
                              <input
                                type="checkbox"
                                checked={bulkSelectedStupi.includes(
                                  stup.id
                                )}
                                onChange={() =>
                                  toggleBulkStup(
                                    stup.id
                                  )
                                }
                              />

                              <span>
                                Stupul{" "}
                                <strong>
                                  {
                                    stup.numar_stup
                                  }
                                </strong>

                                {stup.stupina_id && (
                                  <small
                                    style={
                                      styles.checkboxMeta
                                    }
                                  >
                                    {" "}
                                    •{" "}
                                    {stupine.find(
                                      (
                                        s
                                      ) =>
                                        String(
                                          s.id
                                        ) ===
                                        String(
                                          stup.stupina_id
                                        )
                                    )
                                      ?.nume ||
                                      "Stupină"}
                                  </small>
                                )}
                              </span>
                            </label>
                          )
                        )
                      )}
                    </div>
                  </div>
                )}

                {(bulkType ===
                  "roiuri" ||
                  bulkType ===
                    "ambele") && (
                  <div
                    style={
                      styles.bulkListSection
                    }
                  >
                    <div
                      style={
                        styles.bulkListHeader
                      }
                    >
                      <strong>
                        🐝 Roiuri /
                        Nuclee
                      </strong>

                      <button
                        style={
                          styles.selectAllButton
                        }
                        onClick={
                          selectAllBulkRoiuri
                        }
                      >
                        Selectează /
                        deselectează
                        toate
                      </button>
                    </div>

                    <div
                      style={
                        styles.bulkChecklist
                      }
                    >
                      {bulkRoiuriList.length ===
                      0 ? (
                        <div
                          style={
                            styles.emptyBulk
                          }
                        >
                          Nu există roiuri/nuclee.
                        </div>
                      ) : (
                        bulkRoiuriList.map(
                          (roi) => (
                            <label
                              key={
                                roi.id
                              }
                              style={
                                styles.checkboxRow
                              }
                            >
                              <input
                                type="checkbox"
                                checked={bulkSelectedRoiuri.includes(
                                  roi.id
                                )}
                                onChange={() =>
                                  toggleBulkRoi(
                                    roi.id
                                  )
                                }
                              />

                              <span>
                                {roi.tip}{" "}
                                <strong>
                                  {
                                    roi.numar
                                  }
                                </strong>
                              </span>
                            </label>
                          )
                        )
                      )}
                    </div>
                  </div>
                )}

                <button
                  style={
                    styles.selectAllFamiliesButton
                  }
                  onClick={
                    selectAllBulkFamilies
                  }
                >
                  ☑️ Selectează / deselectează toate familiile
                </button>
              </div>
            )}

            <div
              style={
                styles.bulkFieldsBox
              }
            >
              <h3
                style={
                  styles.bulkSectionTitle
                }
              >
                3. Ce date vrei să modifici?
              </h3>

              <p
                style={
                  styles.bulkHint
                }
              >
                Bifează doar câmpurile pe care vrei să le modifici. Cele nebifate rămân neschimbate.
              </p>

              <BulkField
                checked={
                  bulkFields.matca
                }
                onChange={() =>
                  toggleBulkField(
                    "matca"
                  )
                }
                label="👑 Rasa mătcii"
              >
                <input
                  style={
                    styles.input
                  }
                  type="text"
                  placeholder="Ex: Carnica, Buckfast, Carpatină"
                  value={
                    bulkData.matca
                  }
                  onChange={(e) =>
                    setBulkData(
                      {
                        ...bulkData,
                        matca:
                          e.target
                            .value,
                      }
                    )
                  }
                />
              </BulkField>

              <BulkField
                checked={
                  bulkFields.are_matca
                }
                onChange={() =>
                  toggleBulkField(
                    "are_matca"
                  )
                }
                label="👑 Are matcă?"
              >
                <select
                  style={
                    styles.input
                  }
                  value={
                    bulkData.are_matca
                  }
                  onChange={(e) =>
                    setBulkData(
                      {
                        ...bulkData,
                        are_matca:
                          e.target
                            .value,
                      }
                    )
                  }
                >
                  <option value="Da">
                    Da
                  </option>

                  <option value="Nu">
                    Nu
                  </option>
                </select>
              </BulkField>

              <BulkField
                checked={
                  bulkFields.an_matca
                }
                onChange={() =>
                  toggleBulkField(
                    "an_matca"
                  )
                }
                label="📅 An matcă"
              >
                <input
                  style={
                    styles.input
                  }
                  type="number"
                  min="2000"
                  max="2100"
                  placeholder="Ex: 2026"
                  value={
                    bulkData.an_matca
                  }
                  onChange={(e) =>
                    setBulkData(
                      {
                        ...bulkData,
                        an_matca:
                          e.target
                            .value,
                      }
                    )
                  }
                />
              </BulkField>

              <div
                style={
                  styles.bulkNumberGrid
                }
              >
                <BulkField
                  checked={
                    bulkFields.rame
                  }
                  onChange={() =>
                    toggleBulkField(
                      "rame"
                    )
                  }
                  label="🪵 Rame"
                >
                  <input
                    style={
                      styles.input
                    }
                    type="number"
                    min="0"
                    value={
                      bulkData.rame
                    }
                    onChange={(e) =>
                      setBulkData(
                        {
                          ...bulkData,
                          rame: e
                            .target
                            .value,
                        }
                      )
                    }
                  />
                </BulkField>

                <BulkField
                  checked={
                    bulkFields.rame_puiet
                  }
                  onChange={() =>
                    toggleBulkField(
                      "rame_puiet"
                    )
                  }
                  label="🐣 Rame puiet"
                >
                  <input
                    style={
                      styles.input
                    }
                    type="number"
                    min="0"
                    value={
                      bulkData.rame_puiet
                    }
                    onChange={(e) =>
                      setBulkData(
                        {
                          ...bulkData,
                          rame_puiet:
                            e.target
                              .value,
                        }
                      )
                    }
                  />
                </BulkField>

                <BulkField
                  checked={
                    bulkFields.rame_miere
                  }
                  onChange={() =>
                    toggleBulkField(
                      "rame_miere"
                    )
                  }
                  label="🍯 Rame miere"
                >
                  <input
                    style={
                      styles.input
                    }
                    type="number"
                    min="0"
                    value={
                      bulkData.rame_miere
                    }
                    onChange={(e) =>
                      setBulkData(
                        {
                          ...bulkData,
                          rame_miere:
                            e.target
                              .value,
                        }
                      )
                    }
                  />
                </BulkField>

                <BulkField
                  checked={
                    bulkFields.rame_polen
                  }
                  onChange={() =>
                    toggleBulkField(
                      "rame_polen"
                    )
                  }
                  label="🌼 Rame polen"
                >
                  <input
                    style={
                      styles.input
                    }
                    type="number"
                    min="0"
                    value={
                      bulkData.rame_polen
                    }
                    onChange={(e) =>
                      setBulkData(
                        {
                          ...bulkData,
                          rame_polen:
                            e.target
                              .value,
                        }
                      )
                    }
                  />
                </BulkField>
              </div>

              <BulkField
                checked={
                  bulkFields.miere_kg
                }
                onChange={() =>
                  toggleBulkField(
                    "miere_kg"
                  )
                }
                label="🍯 Miere (kg)"
              >
                <input
                  style={
                    styles.input
                  }
                  type="number"
                  min="0"
                  step="0.1"
                  value={
                    bulkData.miere_kg
                  }
                  onChange={(e) =>
                    setBulkData(
                      {
                        ...bulkData,
                        miere_kg:
                          e.target
                            .value,
                      }
                    )
                  }
                />
              </BulkField>

              <BulkField
                checked={
                  bulkFields.status
                }
                onChange={() =>
                  toggleBulkField(
                    "status"
                  )
                }
                label="🔄 Status"
              >
                <select
                  style={
                    styles.input
                  }
                  value={
                    bulkData.status
                  }
                  onChange={(e) =>
                    setBulkData(
                      {
                        ...bulkData,
                        status:
                          e.target
                            .value,
                      }
                    )
                  }
                >
                  <option value="Activ">
                    Activ
                  </option>

                  <option value="Inactiv">
                    Inactiv
                  </option>

                  <option value="Vândut">
                    Vândut
                  </option>

                  <option value="Unit">
                    Unit
                  </option>

                  <option value="Pierdut">
                    Pierdut
                  </option>
                </select>
              </BulkField>

              <BulkField
                checked={
                  bulkFields.observatii
                }
                onChange={() =>
                  toggleBulkField(
                    "observatii"
                  )
                }
                label="📝 Observații"
              >
                <textarea
                  style={
                    styles.textarea
                  }
                  placeholder="Observație care va fi pusă la toate familiile selectate..."
                  value={
                    bulkData.observatii
                  }
                  onChange={(e) =>
                    setBulkData(
                      {
                        ...bulkData,
                        observatii:
                          e.target
                            .value,
                      }
                    )
                  }
                />
              </BulkField>
            </div>

            <div
              style={
                styles.bulkFinalSummary
              }
            >
              <strong>
                📌 Rezumat
              </strong>

              <div>
                {bulkCounts.total} familii vor fi modificate
              </div>

              <div>
                {Object.values(
                  bulkFields
                ).filter(Boolean).length}{" "}
                câmpuri selectate
              </div>
            </div>

            <button
              style={
                styles.bulkSaveButton
              }
              onClick={
                applyBulkEdit
              }
              disabled={
                savingBulkEdit ||
                bulkCounts.total ===
                  0
              }
            >
              {savingBulkEdit
                ? "⏳ Se modifică..."
                : "💾 Aplică modificarea la " +
                  bulkCounts.total +
                  " familii"}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          ADAUGĂ STUP
         ====================================================== */}

      {showAddStup && (
        <div
          style={styles.overlay}
        >
          <div
            style={
              styles.smallModal
            }
          >
            <button
              style={
                styles.closeButton
              }
              onClick={() =>
                setShowAddStup(
                  false
                )
              }
            >
              ×
            </button>

            <h2
              style={
                styles.modalTitle
              }
            >
              ➕ Adaugă stup nou
            </h2>

            <p
              style={
                styles.modalDescription
              }
            >
              Introdu numărul noului stup.
            </p>

            <label
              style={styles.label}
            >
              Număr stup
            </label>

            <input
              style={styles.input}
              type="number"
              min="1"
              value={
                newStupNumber
              }
              placeholder="Ex: 201"
              onChange={(e) =>
                setNewStupNumber(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  addStup();
                }
              }}
              autoFocus
            />

            <button
              style={
                styles.confirmButton
              }
              onClick={addStup}
              disabled={
                savingStup
              }
            >
              {savingStup
                ? "Se adaugă..."
                : "💾 Adaugă stupul"}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          ADAUGĂ MAI MULȚI STUPI
         ====================================================== */}

      {showAddMultiple && (
        <div
          style={styles.overlay}
        >
          <div
            style={
              styles.smallModal
            }
          >
            <button
              style={
                styles.closeButton
              }
              onClick={() => {
                setShowAddMultiple(
                  false
                );
                setMultipleStupiCount(
                  ""
                );
              }}
            >
              ×
            </button>

            <h2
              style={
                styles.modalTitle
              }
            >
              ➕ Adaugă mai mulți stupi
            </h2>

            <p
              style={
                styles.modalDescription
              }
            >
              Spune câte familii noi vrei să adaugi. Aplicația va numerota automat stupii.
            </p>

            <div
              style={
                styles.nextNumberBox
              }
            >
              <div
                style={
                  styles.nextNumberLabel
                }
              >
                Următorul număr disponibil
              </div>

              <div
                style={
                  styles.nextNumberValue
                }
              >
                Stupul{" "}
                {nextStupNumber}
              </div>
            </div>

            <label
              style={styles.label}
            >
              Câte familii vrei să adaugi?
            </label>

            <input
              style={styles.input}
              type="number"
              min="1"
              max="1000"
              value={
                multipleStupiCount
              }
              placeholder="Ex: 20"
              onChange={(e) =>
                setMultipleStupiCount(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  addMultipleStupi();
                }
              }}
              autoFocus
            />

            {multipleCountNumber >
              0 && (
              <div
                style={
                  styles.previewBox
                }
              >
                Se vor adăuga:
                <strong>
                  {" "}
                  {
                    multipleCountNumber
                  }{" "}
                  {multipleCountNumber ===
                  1
                    ? "familie"
                    : "familii"}
                </strong>

                <br />

                Stupii{" "}
                <strong>
                  {
                    nextStupNumber
                  }
                </strong>{" "}
                –{" "}
                <strong>
                  {
                    multipleLastNumber
                  }
                </strong>
              </div>
            )}

            <button
              style={
                styles.confirmButton
              }
              onClick={
                addMultipleStupi
              }
              disabled={
                savingMultiple ||
                !multipleStupiCount
              }
            >
              {savingMultiple
                ? "Se adaugă..."
                : "🐝 Adaugă familiile"}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          ASOCIAZĂ CU STUPINA
         ====================================================== */}

      {showAddToStupina && (
        <div
          style={styles.overlay}
        >
          <div
            style={
              styles.smallModal
            }
          >
            <button
              style={
                styles.closeButton
              }
              onClick={() => {
                setShowAddToStupina(
                  false
                );
                setSelectedStupina(
                  ""
                );
              }}
            >
              ×
            </button>

            <h2
              style={
                styles.modalTitle
              }
            >
              📍{" "}
              {selectedFamilie?.stupina_id
                ? "Schimbă stupina"
                : "Adaugă la stupină"}
            </h2>

            <p
              style={
                styles.modalDescription
              }
            >
              Stupul{" "}
              <strong>
                {
                  selectedFamilie?.numar_stup
                }
              </strong>{" "}
              va fi asociat cu stupina selectată.
            </p>

            {stupine.length ===
            0 ? (
              <div
                style={
                  styles.noStupineBox
                }
              >
                Nu există încă nicio stupină.
                <br />
                Creează mai întâi una din pagina{" "}
                <strong>
                  „Stupine”
                </strong>
                .
              </div>
            ) : (
              <>
                <label
                  style={
                    styles.label
                  }
                >
                  Alege stupina
                </label>

                <select
                  style={
                    styles.input
                  }
                  value={
                    selectedStupina
                  }
                  onChange={(e) =>
                    setSelectedStupina(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Selectează stupina
                  </option>

                  {stupine.map(
                    (stupina) => (
                      <option
                        key={
                          stupina.id
                        }
                        value={
                          stupina.id
                        }
                      >
                        {stupina.nume}
                        {stupina.locatie
                          ? " — " +
                            stupina.locatie
                          : ""}
                      </option>
                    )
                  )}
                </select>

                <button
                  style={
                    styles.confirmButton
                  }
                  onClick={
                    addStupToStupina
                  }
                  disabled={
                    savingStupina ||
                    !selectedStupina
                  }
                >
                  {savingStupina
                    ? "Se salvează..."
                    : selectedFamilie?.stupina_id
                    ? "🔄 Schimbă stupina"
                    : "📍 Adaugă la stupină"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          VERIFICARE
         ====================================================== */}

      {showVerification && (
        <div
          style={styles.overlay}
        >
          <div
            style={styles.modal}
          >
            <button
              style={
                styles.closeButton
              }
              onClick={() =>
                setShowVerification(
                  false
                )
              }
            >
              ×
            </button>

            <h2
              style={
                styles.modalTitle
              }
            >
              📝 Verificare{" "}
              {selectedFamilie?.tipFamilie ===
              "Stup"
                ? "Stupul " +
                  selectedFamilie?.numar_stup
                : selectedFamilie?.tip +
                  " " +
                  selectedFamilie?.numar}
            </h2>

            <p
              style={
                styles.modalDescription
              }
            >
              Completează datele observate la verificarea familiei.
            </p>

            <label
              style={styles.label}
            >
              Data verificării
            </label>

            <input
              style={styles.input}
              type="date"
              value={
                verification.data
              }
              onChange={(e) =>
                setVerification({
                  ...verification,
                  data: e.target.value,
                })
              }
            />

            <label
              style={styles.label}
            >
              Rasa mătcii
            </label>

            <input
              style={styles.input}
              type="text"
              placeholder="Ex: Buckfast, Carpatină, Carnica"
              value={
                verification.matca
              }
              onChange={(e) =>
                setVerification({
                  ...verification,
                  matca:
                    e.target.value,
                })
              }
            />

            <label
              style={styles.label}
            >
              Are matcă?
            </label>

            <select
              style={styles.input}
              value={
                verification.are_matca
              }
              onChange={(e) =>
                setVerification({
                  ...verification,
                  are_matca:
                    e.target.value,
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

            <label
              style={styles.label}
            >
              An matcă
            </label>

            <input
              style={styles.input}
              type="number"
              value={
                verification.an_matca
              }
              onChange={(e) =>
                setVerification({
                  ...verification,
                  an_matca:
                    e.target.value,
                })
              }
            />

            <div
              style={
                styles.numberGrid
              }
            >
              <NumberField
                label="Rame"
                value={
                  verification.rame
                }
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame: value,
                  })
                }
              />

              <NumberField
                label="Rame puiet"
                value={
                  verification.rame_puiet
                }
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame_puiet:
                      value,
                  })
                }
              />

              <NumberField
                label="Rame miere"
                value={
                  verification.rame_miere
                }
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame_miere:
                      value,
                  })
                }
              />

              <NumberField
                label="Rame polen"
                value={
                  verification.rame_polen
                }
                onChange={(value) =>
                  setVerification({
                    ...verification,
                    rame_polen:
                      value,
                  })
                }
              />
            </div>

            <label
              style={styles.label}
            >
              Observații
            </label>

            <textarea
              style={
                styles.textarea
              }
              placeholder="Ex: familie puternică, puiet compact..."
              value={
                verification.observatii
              }
              onChange={(e) =>
                setVerification({
                  ...verification,
                  observatii:
                    e.target.value,
                })
              }
            />

            <button
              style={
                styles.confirmButton
              }
              onClick={
                saveVerification
              }
              disabled={
                savingVerification
              }
            >
              {savingVerification
                ? "Se salvează..."
                : "💾 Salvează verificarea"}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          TRATAMENT
         ====================================================== */}

      {showTreatment && (
        <div
          style={styles.overlay}
        >
          <div
            style={styles.modal}
          >
            <button
              style={
                styles.closeButton
              }
              onClick={() =>
                setShowTreatment(
                  false
                )
              }
            >
              ×
            </button>

            <h2
              style={
                styles.modalTitle
              }
            >
              💊 Tratament pentru toate familiile
            </h2>

            <p
              style={
                styles.modalDescription
              }
            >
              Tratamentul va fi adăugat în istoricul tuturor celor{" "}
              <strong>
                {totalFamilii} familii
              </strong>
              :{" "}
              {stupi.length} stupi +{" "}
              {roiuri.length} roiuri/nuclee.
            </p>

            <label
              style={styles.label}
            >
              Tratament
            </label>

            <select
              style={styles.input}
              value={
                treatment.tip
              }
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

            <label
              style={styles.label}
            >
              Data tratamentului
            </label>

            <input
              style={styles.input}
              type="date"
              value={
                treatment.data
              }
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  data: e.target.value,
                })
              }
            />

            <label
              style={styles.label}
            >
              Detalii
            </label>

            <textarea
              style={
                styles.textarea
              }
              placeholder="Ex: Penultima tranșă, 2 pufuri..."
              value={
                treatment.detalii
              }
              onChange={(e) =>
                setTreatment({
                  ...treatment,
                  detalii:
                    e.target.value,
                })
              }
            />

            <button
              style={
                styles.confirmButton
              }
              onClick={
                applyTreatmentToAll
              }
              disabled={
                savingTreatment
              }
            >
              {savingTreatment
                ? "Se adaugă..."
                : "💾 Aplică la toate cele " +
                  totalFamilii +
                  " familii"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/*
 * ============================================================
 * COMPONENTE
 * ============================================================
 */

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div
      style={styles.statCard}
    >
      <div
        style={styles.statIcon}
      >
        {icon}
      </div>

      <div>
        <div
          style={styles.statTitle}
        >
          {title}
        </div>

        <div
          style={styles.statValue}
        >
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
      <label
        style={styles.label}
      >
        {label}
      </label>

      <input
        style={styles.input}
        type="number"
        min="0"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      />
    </div>
  );
}

function BulkField({
  checked,
  onChange,
  label,
  children,
}) {
  return (
    <div
      style={
        styles.bulkField
      }
    >
      <label
        style={
          styles.bulkFieldHeader
        }
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />

        <strong>
          {label}
        </strong>
      </label>

      {checked && (
        <div
          style={
            styles.bulkFieldContent
          }
        >
          {children}
        </div>
      )}
    </div>
  );
}

/*
 * ============================================================
 * STILURI
 * ============================================================
 */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    background: "#f4f5f2",
    fontFamily:
      "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
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
    border:
      "1px solid #f1c27d",
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
    border:
      "1px solid #e0b56d",
    borderRadius: "8px",
    padding: "8px 10px",
    textDecoration: "none",
    color: "#7a4d00",
    fontWeight: "bold",
    fontSize: "13px",
  },

  alertRoiItem: {
    background: "#fff8df",
    border:
      "1px solid #eadb9a",
    borderRadius: "8px",
    padding: "8px 10px",
    textDecoration: "none",
    color: "#5d4a00",
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
    border:
      "1px solid #ccc",
    borderRadius: "9px",
    fontSize: "16px",
  },

  searchResults: {
    marginTop: "15px",
    borderTop:
      "1px solid #eee",
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
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "11px 13px",
    borderRadius: "9px",
    background: "#f4f4f4",
    color: "#222",
    textDecoration: "none",
    border:
      "1px solid #e5e5e5",
  },

  searchRoiItem: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "11px 13px",
    borderRadius: "9px",
    background: "#fff8df",
    color: "#5d4a00",
    textDecoration: "none",
    border:
      "1px solid #eadb9a",
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

  stupineButton: {
    padding: "12px 18px",
    background: "#f59e0b",
    color: "#fff",
    borderRadius: "9px",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
  },

  addMultipleButton: {
    padding: "12px 18px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },

  bulkEditButton: {
    padding: "12px 18px",
    background: "#7c3aed",
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
    justifyContent:
      "space-between",
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

  mainTableSection: {
    background: "#fff",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "25px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.06)",
  },

  mainTableHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },

  mainTableTitle: {
    margin: 0,
    fontSize: "21px",
  },

  mainTableSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#777",
    fontSize: "14px",
  },

  tableFamilyCount: {
    background: "#f3f4f6",
    padding: "8px 12px",
    borderRadius: "8px",
    color: "#555",
    fontWeight: "bold",
    fontSize: "13px",
  },

  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1800px",
  },

  th: {
    padding: "14px",
    textAlign: "left",
    borderBottom:
      "2px solid #ddd",
    background: "#fafafa",
  },

  td: {
    padding: "12px 14px",
    borderBottom:
      "1px solid #eee",
  },

  tdNumber: {
    padding: "12px 14px",
    borderBottom:
      "1px solid #eee",
    fontWeight: "bold",
  },

  actionCell: {
    minWidth: "190px",
  },

  actionButtons: {
    display: "flex",
    gap: "7px",
    flexDirection: "column",
  },

  stupinaLocation: {
    marginTop: "3px",
    color: "#777",
    fontSize: "12px",
  },

  noStupina: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "7px",
    background: "#f3f4f6",
    color: "#777",
    fontSize: "12px",
  },

  stupinaActionButton: {
    border: "none",
    borderRadius: "8px",
    padding: "9px 12px",
    background: "#f59e0b",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  removeStupinaButton: {
    border: "none",
    borderRadius: "8px",
    padding: "9px 12px",
    background: "#6b7280",
    color: "#fff",
    cursor: "pointer",
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

  roiLink: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#fff3cd",
    color: "#856404",
    textDecoration: "none",
    fontWeight: "bold",
  },

  familyStupBadge: {
    display: "inline-block",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#e5e7eb",
    color: "#333",
    fontWeight: "bold",
    fontSize: "12px",
  },

  familyRoiBadge: {
    display: "inline-block",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#fff3cd",
    color: "#856404",
    fontWeight: "bold",
    fontSize: "12px",
  },

  familyNucleuBadge: {
    display: "inline-block",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#d1ecf1",
    color: "#0c5460",
    fontWeight: "bold",
    fontSize: "12px",
  },

  queenYes: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "7px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: "bold",
    fontSize: "13px",
  },

  queenNo: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "7px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: "bold",
    fontSize: "13px",
  },

  statusSelect: {
    minWidth: "110px",
    padding: "8px 10px",
    borderRadius: "8px",
    border:
      "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
  },

  statusSelectActive: {
    background: "#dcfce7",
    color: "#166534",
    border:
      "1px solid #86efac",
  },

  statusSelectInactive: {
    background: "#fee2e2",
    color: "#991b1b",
    border:
      "1px solid #fca5a5",
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

  deleteStupButton: {
    border: "none",
    borderRadius: "8px",
    padding: "9px 12px",
    background: "#d32f2f",
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
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f7f7f7",
    borderRadius: "10px",
    border:
      "1px solid #eee",
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

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,0.5)",
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

  bulkModal: {
    width: "100%",
    maxWidth: "760px",
    maxHeight: "92vh",
    overflowY: "auto",
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
    background:
      "transparent",
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
    border:
      "1px solid #ccc",
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
    border:
      "1px solid #ccc",
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

  nextNumberBox: {
    background: "#eef6ff",
    border:
      "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "14px",
    textAlign: "center",
    marginBottom: "18px",
  },

  nextNumberLabel: {
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "4px",
  },

  nextNumberValue: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1976d2",
  },

  previewBox: {
    marginTop: "12px",
    padding: "12px",
    background: "#f0fdf4",
    border:
      "1px solid #bbf7d0",
    borderRadius: "9px",
    color: "#166534",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  noStupineBox: {
    background: "#fff7ed",
    border:
      "1px solid #fed7aa",
    borderRadius: "10px",
    padding: "15px",
    color: "#9a3412",
    lineHeight: "1.6",
  },

  row: {
    transition:
      "background 0.2s",
  },

  /*
   * MODIFICARE ÎN MASĂ
   */

  bulkInfoBox: {
    background: "#fff7ed",
    border:
      "1px solid #fed7aa",
    color: "#9a3412",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "15px",
  },

  bulkSelectedSummary: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
    background: "#eef6ff",
    border:
      "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "15px",
    color: "#1e40af",
    fontSize: "13px",
  },

  manualSelection: {
    marginTop: "15px",
  },

  bulkListSection: {
    border:
      "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "12px",
    background: "#fafafa",
  },

  bulkListHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },

  selectAllButton: {
    border: "none",
    borderRadius: "7px",
    padding: "7px 10px",
    background: "#e5e7eb",
    color: "#374151",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },

  bulkChecklist: {
    maxHeight: "220px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "8px 9px",
    background: "#fff",
    border:
      "1px solid #eee",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "14px",
  },

  checkboxMeta: {
    color: "#888",
    fontSize: "11px",
  },

  emptyBulk: {
    padding: "15px",
    textAlign: "center",
    color: "#777",
  },

  selectAllFamiliesButton: {
    width: "100%",
    padding: "11px",
    border:
      "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#334155",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  bulkFieldsBox: {
    marginTop: "20px",
    borderTop:
      "1px solid #e5e7eb",
    paddingTop: "18px",
  },

  bulkSectionTitle: {
    margin: 0,
    fontSize: "18px",
  },

  bulkHint: {
    color: "#777",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  bulkField: {
    border:
      "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "10px",
    background: "#fafafa",
  },

  bulkFieldHeader: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    cursor: "pointer",
    fontSize: "14px",
  },

  bulkFieldContent: {
    marginTop: "10px",
    paddingLeft: "25px",
  },

  bulkNumberGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "10px",
  },

  bulkFinalSummary: {
    marginTop: "20px",
    padding: "15px",
    background: "#f0fdf4",
    border:
      "1px solid #bbf7d0",
    borderRadius: "10px",
    color: "#166534",
    lineHeight: "1.7",
  },

  bulkSaveButton: {
    width: "100%",
    marginTop: "15px",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
};
