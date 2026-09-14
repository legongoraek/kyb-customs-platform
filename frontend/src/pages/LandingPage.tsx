import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Braces,
  FileCheck2,
  ListChecks,
  SearchCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Seo } from "../components/Seo";

const title = "KYB Customs Platform | Prueba técnica de KYB para comercio exterior";
const description =
  "Case study técnico de Luis Enrique Góngora Ek: plataforma KYB demostrativa para expedientes, validaciones SAT relacionadas y scoring de riesgo explicable en comercio exterior mexicano.";

const faqItems = [
  {
    question: "¿Es un producto listo para producción?",
    answer:
      "No. Es una prueba técnica y una implementación demostrativa creada para mostrar decisiones de arquitectura, validación, scoring de riesgo y trazabilidad.",
  },
  {
    question: "¿Qué problema demuestra resolver?",
    answer:
      "Modela un flujo KYB para evaluar personas morales mexicanas mediante expediente documental, señales relacionadas con SAT, clasificación de riesgo y evidencia auditable.",
  },
  {
    question: "¿Cómo se determina el riesgo?",
    answer:
      "La implementación usa un score determinístico y explicable que deriva en las clasificaciones safe, review_required o high_risk según las señales evaluadas.",
  },
  {
    question: "¿Es un servicio oficial del SAT?",
    answer:
      "No. El proyecto no representa, sustituye ni está afiliado oficialmente al SAT. Las revisiones implementadas usan información y referencias públicas relacionadas con el SAT.",
  },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "KYB Customs Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: "https://kyb-customs-platform.vercel.app/",
    author: {
      "@type": "Person",
      name: "Luis Enrique Góngora Ek",
      url: "https://www.legongoraek.me/",
      sameAs: ["https://github.com/legongoraek"],
    },
    isAccessibleForFree: true,
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Luis Enrique Góngora Ek",
    url: "https://www.legongoraek.me/",
    sameAs: ["https://github.com/legongoraek"],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  },
];

const capabilities = [
  {
    icon: FileCheck2,
    title: "Expediente KYB",
    text: "Creación de expedientes y registro de metadata documental auditable.",
  },
  {
    icon: SearchCheck,
    title: "Validaciones",
    text: "Detección de documentos faltantes o vencidos y revisión del RFC contra información fiscal relacionada con SAT.",
  },
  {
    icon: ShieldCheck,
    title: "Risk scoring explicable",
    text: "Score determinístico con clasificación safe, review_required o high_risk y bloqueo de aprobación cuando el caso no es seguro.",
  },
  {
    icon: ListChecks,
    title: "Trazabilidad",
    text: "Bitácora de auditoría para conservar evidencia de las decisiones y revisiones ejecutadas.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Seo title={title} description={description} path="/" jsonLd={structuredData} />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#inicio" className="flex items-center gap-3 font-bold text-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
              <ShieldCheck size={20} />
            </span>
            <span>KYB Customs Platform</span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/legongoraek/kyb-customs-platform"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:inline-flex"
            >
              GitHub
            </a>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              Ver demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main id="inicio">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                Prueba técnica · Case study
              </p>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
                Plataforma KYB para comercio exterior
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                Implementación demostrativa para evaluar personas morales mexicanas mediante expediente documental,
                validaciones relacionadas con SAT, scoring de riesgo explicable y trazabilidad de decisiones.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
                >
                  Abrir demo <ArrowRight size={18} />
                </Link>
                <a
                  href="https://github.com/legongoraek/kyb-customs-platform"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-900 hover:bg-slate-100"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.2.68.8.56A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                  </svg>{" "}
                  Ver código
                </a>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-6 text-slate-500">
                Este proyecto muestra trabajo de ingeniería y no se presenta como un SaaS comercial, una certificación de cumplimiento ni un servicio oficial del SAT.
              </p>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Alcance implementado</p>
              <dl className="mt-6 space-y-5">
                {[
                  ["Frontend", "React + Vite + TypeScript"],
                  ["Backend", "Node.js + Express + TypeScript"],
                  ["Riesgo", "Score determinístico y explicable"],
                  ["Auditoría", "Evidencia y bitácora de decisiones"],
                ].map(([term, detail]) => (
                  <div key={term} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                    <dt className="text-sm font-semibold text-slate-500">{term}</dt>
                    <dd className="mt-1 font-bold text-slate-900">{detail}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20" aria-labelledby="implementacion">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Qué construí</p>
            <h2 id="implementacion" className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Un flujo KYB demostrativo con reglas visibles y auditables
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              El objetivo técnico es que cada clasificación pueda relacionarse con evidencia y validaciones concretas, en lugar de producir una decisión opaca.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {capabilities.map(({ icon: Icon, title: capabilityTitle, text }) => (
              <article key={capabilityTitle} className="rounded-3xl border border-slate-200 bg-white p-6">
                <Icon className="text-slate-700" size={24} />
                <h3 className="mt-5 text-xl font-bold text-slate-900">{capabilityTitle}</h3>
                <p className="mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-100">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Flujo funcional del caso KYB</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-5">
              {["Crear expediente", "Registrar evidencia", "Validar documentos y RFC", "Calcular riesgo", "Revisar clasificación y auditoría"].map(
                (step, index) => (
                  <li key={step} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <span className="text-sm font-black text-slate-400">0{index + 1}</span>
                    <p className="mt-3 font-bold text-slate-900">{step}</p>
                  </li>
                ),
              )}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-7">
            <Braces className="text-slate-700" size={26} />
            <h2 className="mt-5 text-2xl font-black text-slate-900">Arquitectura y decisiones técnicas</h2>
            <p className="mt-4 leading-7 text-slate-600">
              El repositorio separa una API REST en Node.js + Express + TypeScript y una aplicación React + Vite + TypeScript. El frontend está desplegado en Vercel y el backend en Render.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              La implementación prioriza explicabilidad, validaciones determinísticas y trazabilidad para que el flujo pueda inspeccionarse como parte de la prueba técnica.
            </p>
          </article>

          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-7">
            <BadgeCheck className="text-amber-600" size={26} />
            <h2 className="mt-5 text-2xl font-black text-slate-900">SAT y scoring: alcance demostrativo</h2>
            <p className="mt-4 leading-7 text-slate-700">
              El proyecto incluye revisiones de RFC contra entradas normalizadas de fuentes públicas relacionadas con SAT y conserva evidencia de la revisión. No implica afiliación oficial, certificación regulatoria ni cobertura productiva completa.
            </p>
          </article>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Preguntas frecuentes</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Contexto del proyecto</h2>
            <div className="mt-8 space-y-4">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="font-bold text-slate-900">{item.question}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-slate-100 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-slate-500">
                <UserRound size={24} />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Autor</span>
              </div>
              <h2 className="mt-4 text-3xl font-black text-slate-900">Luis Enrique Góngora Ek</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Proyecto desarrollado como prueba técnica para hacer visibles las decisiones de ingeniería, el flujo KYB implementado y la forma en que se modeló la evaluación de riesgo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.legongoraek.me/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white"
              >
                Ver portafolio
              </a>
              <a
                href="https://github.com/legongoraek"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-900"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>KYB Customs Platform · Prueba técnica demostrativa.</p>
          <Link to="/app" className="font-semibold text-slate-600 hover:text-slate-900">
            Abrir demo
          </Link>
        </div>
      </footer>
    </div>
  );
}
