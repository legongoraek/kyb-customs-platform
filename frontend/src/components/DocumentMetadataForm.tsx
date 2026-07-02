import { useState } from "react";
import type { AddDocumentMetadataPayload } from "../api/kybApi";
import type { KybDocumentType } from "../types/kyb";

const DOCUMENT_TYPES: { value: KybDocumentType; label: string }[] = [
  { value: "ACTA_CONSTITUTIVA", label: "Acta constitutiva" },
  {
    value: "IDENTIFICACION_REPRESENTANTE",
    label: "Identificación representante",
  },
  { value: "PODER_REPRESENTANTE", label: "Poder representante" },
  { value: "COMPROBANTE_DOMICILIO", label: "Comprobante domicilio" },
  { value: "RFC", label: "RFC" },
  {
    value: "CONSTANCIA_SITUACION_FISCAL",
    label: "Constancia situación fiscal",
  },
  {
    value: "MANIFESTACION_BAJO_PROTESTA",
    label: "Manifestación bajo protesta",
  },
  { value: "SOCIOS_ACCIONISTAS", label: "Socios / accionistas" },
  { value: "BENEFICIARIO_CONTROLADOR", label: "Beneficiario controlador" },
];

type Props = {
  onSubmit: (payload: AddDocumentMetadataPayload) => Promise<void>;
};

const fieldWrapperClass = "min-w-0 max-w-full space-y-1";

const inputClass =
  "block min-w-0 max-w-full w-full rounded-xl border border-slate-300 px-3 py-2 text-sm";

const dateInputClass =
  "block min-w-0 max-w-full w-full appearance-none rounded-xl border border-slate-300 px-3 py-2 text-sm";

export function DocumentMetadataForm({ onSubmit }: Props) {
  const [form, setForm] = useState<AddDocumentMetadataPayload>({
    type: "CONSTANCIA_SITUACION_FISCAL",
    issueDate: "",
    expirationDate: "",
    extractedRfc: "",
    extractedLegalName: "",
    extractedAddress: "",
    extractedRepresentative: "",
    fileUrl: "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (
    field: keyof AddDocumentMetadataPayload,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    const payload: AddDocumentMetadataPayload = {
      type: form.type,
      issueDate: form.issueDate || undefined,
      expirationDate: form.expirationDate || undefined,
      extractedRfc: form.extractedRfc || undefined,
      extractedLegalName: form.extractedLegalName || undefined,
      extractedAddress: form.extractedAddress || undefined,
      extractedRepresentative: form.extractedRepresentative || undefined,
      fileUrl: form.fileUrl || undefined,
    };

    try {
      await onSubmit(payload);

      setForm({
        type: "CONSTANCIA_SITUACION_FISCAL",
        issueDate: "",
        expirationDate: "",
        extractedRfc: "",
        extractedLegalName: "",
        extractedAddress: "",
        extractedRepresentative: "",
        fileUrl: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <h3 className="text-lg font-black text-slate-900">
        Registrar metadata auditable
      </h3>

      <div className="mt-5 grid min-w-0 max-w-full grid-cols-1 gap-4 md:grid-cols-2">
        <label className={fieldWrapperClass}>
          <span className="text-sm font-semibold text-slate-700">
            Tipo de documento
          </span>
          <select
            value={form.type}
            onChange={(event) =>
              updateField("type", event.target.value as KybDocumentType)
            }
            className={inputClass}
          >
            {DOCUMENT_TYPES.map((document) => (
              <option key={document.value} value={document.value}>
                {document.label}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldWrapperClass}>
          <span className="text-sm font-semibold text-slate-700">
            Fecha emisión
          </span>
          <input
            type="date"
            value={form.issueDate}
            onChange={(event) => updateField("issueDate", event.target.value)}
            className={dateInputClass}
          />
        </label>

        <label className={fieldWrapperClass}>
          <span className="text-sm font-semibold text-slate-700">
            Fecha vencimiento
          </span>
          <input
            type="date"
            value={form.expirationDate}
            onChange={(event) =>
              updateField("expirationDate", event.target.value)
            }
            className={dateInputClass}
          />
        </label>

        <label className={fieldWrapperClass}>
          <span className="text-sm font-semibold text-slate-700">
            RFC extraído
          </span>
          <input
            value={form.extractedRfc}
            onChange={(event) =>
              updateField("extractedRfc", event.target.value)
            }
            placeholder="ABC010101AB1"
            className={inputClass}
          />
        </label>

        <label className={fieldWrapperClass}>
          <span className="text-sm font-semibold text-slate-700">
            Razón social extraída
          </span>
          <input
            value={form.extractedLegalName}
            onChange={(event) =>
              updateField("extractedLegalName", event.target.value)
            }
            placeholder="COMERCIALIZADORA ABC SA DE CV"
            className={inputClass}
          />
        </label>

        <label className={fieldWrapperClass}>
          <span className="text-sm font-semibold text-slate-700">
            Domicilio extraído
          </span>
          <input
            value={form.extractedAddress}
            onChange={(event) =>
              updateField("extractedAddress", event.target.value)
            }
            placeholder="Calle 60 Centro Mérida Yucatán"
            className={inputClass}
          />
        </label>

        <label className={fieldWrapperClass}>
          <span className="text-sm font-semibold text-slate-700">
            Representante extraído
          </span>
          <input
            value={form.extractedRepresentative}
            onChange={(event) =>
              updateField("extractedRepresentative", event.target.value)
            }
            placeholder="Juan Pérez López"
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
      >
        {loading ? "Guardando..." : "Guardar metadata"}
      </button>
    </form>
  );
}