import { type CSSProperties, useEffect, useMemo, useState } from "react";
import "./App.css";

const OPERACAO = { OPERANDO: "Operando", PARADO: "Parado" } as const;
const CALIBRACAO = {
  REALIZADA: "Realizada",
  NAO_REALIZADA: "Não realizada",
} as const;
const NAO_APLICAVEL = "N.A.";
const TEMA_PADRAO = {
  fundo: "#eef7f3",
  texto: "#17313b",
  primaria: "#0f766e",
  secundaria: "#155e75",
  destaque: "#5eead4",
  sucesso: "#86efac",
  alerta: "#ffedd5",
} as const;

type Tema = typeof TEMA_PADRAO;
type CampoTema = keyof Tema;
type TemaStyle = CSSProperties & Record<`--${string}`, string>;

export default function App() {
  const [adminAberto, setAdminAberto] = useState(false);
  const [tema, setTema] = useState<Tema>(() => {
    const temaSalvo = localStorage.getItem("turnix-tema");

    if (!temaSalvo) {
      return TEMA_PADRAO;
    }

    try {
      return { ...TEMA_PADRAO, ...JSON.parse(temaSalvo) };
    } catch {
      return TEMA_PADRAO;
    }
  });

  const [dados, setDados] = useState({
    onlines: "",
    turno: "C",
    escala: "19 hrs x 7 hrs",
    data: "2026-05-24",
  });

  const [equipamentos, setEquipamentos] = useState([
    {
      nome: "PSI",
      operacao: OPERACAO.OPERANDO,
      problema: NAO_APLICAVEL,
      acoes: NAO_APLICAVEL,
      calibracao: CALIBRACAO.REALIZADA,
      usaAcoes: true,
    },
    {
      nome: "BLUECUB",
      operacao: OPERACAO.OPERANDO,
      problema: NAO_APLICAVEL,
      acoes: NAO_APLICAVEL,
      calibracao: CALIBRACAO.REALIZADA,
      usaAcoes: false,
    },
    {
      nome: "COURIER",
      operacao: OPERACAO.OPERANDO,
      problema: NAO_APLICAVEL,
      acoes: NAO_APLICAVEL,
      calibracao: CALIBRACAO.REALIZADA,
      usaAcoes: true,
    },
  ]);

  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    localStorage.setItem("turnix-tema", JSON.stringify(tema));
  }, [tema]);

  function formatarData(dataIso: string | undefined) {
    if (!dataIso) return "";
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function atualizarDados(campo: string, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarEquipamento(index: number, campo: string, valor: string) {
    setEquipamentos((lista) =>
      lista.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item,
      ),
    );
  }

  function atualizarTema(campo: CampoTema, valor: string) {
    setTema((atual) => ({ ...atual, [campo]: valor }));
  }

  function restaurarTema() {
    setTema(TEMA_PADRAO);
  }

  function statusOperacao(valor: string) {
    return valor === OPERACAO.OPERANDO ? "✅ Operando" : "❌ Parado";
  }

  function statusCalibracao(valor: string) {
    return valor === CALIBRACAO.REALIZADA
      ? `✅ ${CALIBRACAO.REALIZADA}`
      : `❌ ${CALIBRACAO.NAO_REALIZADA}`;
  }

  const relatorio = useMemo(() => {
    const linhas = [];

    linhas.push(`*RELATÓRIO DE TURNO ${dados.turno}*`);
    linhas.push("──────────────────");
    linhas.push(`👤 *Onlines:* ${dados.onlines || ""}`);
    linhas.push(`🔄 Turno: ${dados.turno}`);
    linhas.push(`🕐 Escala: ${dados.escala}`);
    linhas.push(`📅 Data: ${formatarData(dados.data)}`);
    linhas.push("──────────────────");

    equipamentos.forEach((eq) => {
      linhas.push(`📊 ${eq.nome}`);
      linhas.push(`▪️ Operação: ${statusOperacao(eq.operacao)}`);
      linhas.push(`▪️ Problema: ${eq.problema || NAO_APLICAVEL}`);
      if (eq.usaAcoes) {
        linhas.push(`▪️ Ações tomadas: ${eq.acoes || NAO_APLICAVEL}`);
      }
      linhas.push(`▪️ Calibração: ${statusCalibracao(eq.calibracao)}`);
      linhas.push("──────────────────");
    });

    return linhas.join("\n");
  }, [dados, equipamentos]);

  async function copiarRelatorio() {
    try {
      await navigator.clipboard.writeText(relatorio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  function compartilharWhatsApp() {
    const texto = encodeURIComponent(relatorio);
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  }

  const temaStyle: TemaStyle = {
    "--app-bg": tema.fundo,
    "--app-text": tema.texto,
    "--app-primary": tema.primaria,
    "--app-secondary": tema.secundaria,
    "--app-accent": tema.destaque,
    "--app-success": tema.sucesso,
    "--app-alert": tema.alerta,
  };

  return (
    <main className="app-shell" style={temaStyle}>
      <div className="app-container">
        <header className="app-header">
          <div>
            <h1>Turnix</h1>
            <p>Gere relatórios de turno em segundos.</p>
          </div>
          <div className="header-actions">
            <button
              className="admin-toggle"
              onClick={() => setAdminAberto((aberto) => !aberto)}
              type="button"
            >
              {adminAberto ? "Fechar admin" : "Administrador"}
            </button>
            <span className="header-badge">Turno {dados.turno}</span>
          </div>
        </header>

        {adminAberto && (
          <section className="admin-panel">
            <div className="panel-title-row">
              <h2>Administrador</h2>
              <button
                className="button-secondary"
                onClick={restaurarTema}
                type="button"
              >
                Restaurar padrão
              </button>
            </div>

            <div className="theme-grid">
              {Object.entries(tema).map(([campo, valor]) => (
                <label className="color-field" key={campo}>
                  <span>{campo}</span>
                  <input
                    type="color"
                    value={valor}
                    onChange={(e) =>
                      atualizarTema(campo as CampoTema, e.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          </section>
        )}

        <section className="panel">
          <h2>Dados gerais</h2>

          <label className="field field-full">
            <span>Onlines</span>
            <input
              value={dados.onlines}
              onChange={(e) => atualizarDados("onlines", e.target.value)}
              placeholder="Ex: Abraão, Estevão"
            />
          </label>

          <div className="field-grid field-grid-three">
            <label className="field">
              <span>Turno</span>
              <select
                value={dados.turno}
                onChange={(e) => atualizarDados("turno", e.target.value)}
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </label>

            <label className="field">
              <span>Escala</span>
              <input
                value={dados.escala}
                onChange={(e) => atualizarDados("escala", e.target.value)}
              />
            </label>

            <label className="field">
              <span>Data</span>
              <input
                type="date"
                value={dados.data}
                onChange={(e) => atualizarDados("data", e.target.value)}
              />
            </label>
          </div>
        </section>

        {equipamentos.map((eq, index) => (
          <section
            key={eq.nome}
            className="panel equipment-panel"
          >
            <div className="panel-title-row">
              <h2>📊 {eq.nome}</h2>
              <span
                className={
                  eq.operacao === OPERACAO.OPERANDO
                    ? "status-pill status-ok"
                    : "status-pill status-alert"
                }
              >
                {eq.operacao}
              </span>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Operação</span>
                <select
                  value={eq.operacao}
                  onChange={(e) =>
                    atualizarEquipamento(index, "operacao", e.target.value)
                  }
                >
                  <option>{OPERACAO.OPERANDO}</option>
                  <option>{OPERACAO.PARADO}</option>
                </select>
              </label>

              <label className="field">
                <span>Calibração</span>
                <select
                  value={eq.calibracao}
                  onChange={(e) =>
                    atualizarEquipamento(index, "calibracao", e.target.value)
                  }
                >
                  <option>{CALIBRACAO.REALIZADA}</option>
                  <option>{CALIBRACAO.NAO_REALIZADA}</option>
                </select>
              </label>
            </div>

            <label className="field field-full">
              <span>Problema</span>
              <textarea
                rows={2}
                value={eq.problema}
                onChange={(e) =>
                  atualizarEquipamento(index, "problema", e.target.value)
                }
              />
            </label>

            {eq.usaAcoes && (
              <label className="field field-full">
                <span>Ações tomadas</span>
                <textarea
                  rows={2}
                  value={eq.acoes}
                  onChange={(e) =>
                    atualizarEquipamento(index, "acoes", e.target.value)
                  }
                />
              </label>
            )}
          </section>
        ))}

        <section className="report-panel">
          <h2>Relatório gerado</h2>
          <pre>{relatorio}</pre>

          <div className="action-grid">
            <button onClick={copiarRelatorio} className="button-primary">
              {copiado ? "✅ Copiado" : "📋 Copiar relatório"}
            </button>

            <button onClick={compartilharWhatsApp} className="button-whatsapp">
              📤 Enviar no WhatsApp
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
