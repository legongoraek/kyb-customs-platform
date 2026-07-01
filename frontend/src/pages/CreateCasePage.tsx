import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { kybApi } from "../api/kybApi";

export function CreateCasePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rfc: "",
    legalName: "",
    address: "",
    legalRepresentativeName: "",
    beneficialOwner: "",
    shareholders: "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    try {
      const created = await kybApi.createCase({
        rfc: form.rfc,
        legalName: form.legalName,
        address: form.address,
        legalRepresentativeName: form.legalRepresentativeName,
        beneficialOwner: form.beneficialOwner || undefined,
        shareholders: form.shareholders
          ? form.shareholders
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
      });

      navigate(`/cases/${created.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <h1 className="text-3xl font-black text-slate-900">
          Nuevo expediente KYB
        </h1>
        <p className="mt-1 text-slate-500">
          Registra la información inicial de la persona moral.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">RFC</span>
            <input
              required
              maxLength={13}
              value={form.rfc}
              onChange={(event) => updateField("rfc", event.target.value)}
              placeholder="ABC010101AB1"
              className="w-full rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Razón social
            </span>
            <input
              required
              value={form.legalName}
              onChange={(event) => updateField("legalName", event.target.value)}
              placeholder="Comercializadora ABC SA de CV"
              className="w-full rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Domicilio
            </span>
            <textarea
              required
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Calle 60 Centro Mérida Yucatán"
              className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Representante legal
            </span>
            <input
              required
              value={form.legalRepresentativeName}
              onChange={(event) =>
                updateField("legalRepresentativeName", event.target.value)
              }
              placeholder="Juan Pérez López"
              className="w-full rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Socios / accionistas
            </span>
            <input
              value={form.shareholders}
              onChange={(event) =>
                updateField("shareholders", event.target.value)
              }
              placeholder="Nombre 1, Nombre 2"
              className="w-full rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">
              Beneficiario controlador
            </span>
            <input
              value={form.beneficialOwner}
              onChange={(event) =>
                updateField("beneficialOwner", event.target.value)
              }
              placeholder="Nombre del beneficiario controlador"
              className="w-full rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-700"
        >
          {loading ? "Creando..." : "Crear expediente"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          disabled={loading}
          className="mt-3 w-full rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}