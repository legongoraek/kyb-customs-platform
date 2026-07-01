"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addKybDocumentMetadataSchema = exports.createKybCaseSchema = void 0;
const zod_1 = require("zod");
const kyb_constants_1 = require("./kyb.constants");
exports.createKybCaseSchema = zod_1.z.object({
    rfc: zod_1.z
        .string()
        .min(12, "RFC inválido")
        .max(13, "RFC inválido")
        .transform((value) => value.trim().toUpperCase()),
    legalName: zod_1.z
        .string()
        .min(3, "La razón social es obligatoria")
        .transform((value) => value.trim().toUpperCase()),
    address: zod_1.z
        .string()
        .min(5, "El domicilio es obligatorio")
        .transform((value) => value.trim()),
    legalRepresentativeName: zod_1.z
        .string()
        .min(3, "El representante legal es obligatorio")
        .transform((value) => value.trim().toUpperCase()),
    shareholders: zod_1.z.array(zod_1.z.string()).optional(),
    beneficialOwner: zod_1.z.string().optional(),
});
exports.addKybDocumentMetadataSchema = zod_1.z.object({
    type: zod_1.z.enum([
        kyb_constants_1.KYB_DOCUMENT_TYPES.ACTA_CONSTITUTIVA,
        kyb_constants_1.KYB_DOCUMENT_TYPES.IDENTIFICACION_REPRESENTANTE,
        kyb_constants_1.KYB_DOCUMENT_TYPES.PODER_REPRESENTANTE,
        kyb_constants_1.KYB_DOCUMENT_TYPES.COMPROBANTE_DOMICILIO,
        kyb_constants_1.KYB_DOCUMENT_TYPES.RFC,
        kyb_constants_1.KYB_DOCUMENT_TYPES.CONSTANCIA_SITUACION_FISCAL,
        kyb_constants_1.KYB_DOCUMENT_TYPES.MANIFESTACION_BAJO_PROTESTA,
        kyb_constants_1.KYB_DOCUMENT_TYPES.SOCIOS_ACCIONISTAS,
        kyb_constants_1.KYB_DOCUMENT_TYPES.BENEFICIARIO_CONTROLADOR,
    ]),
    issueDate: zod_1.z.string().optional(),
    expirationDate: zod_1.z.string().optional(),
    extractedRfc: zod_1.z.string().optional(),
    extractedLegalName: zod_1.z.string().optional(),
    extractedAddress: zod_1.z.string().optional(),
    extractedRepresentative: zod_1.z.string().optional(),
    fileUrl: zod_1.z.string().optional(),
});
