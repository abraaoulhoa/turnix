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
const CORES_TURNO = {
  A: {
    fundo: "#064e3b",
    seloFundo: "#052e2b",
    seloTexto: "#ffffff",
  },
  B: {
    fundo: "#bbf7d0",
    seloFundo: "#86efac",
    seloTexto: "#064e3b",
  },
  C: {
    fundo: "#ffffff",
    seloFundo: "#ffffff",
    seloTexto: "#17313b",
  },
} as const;
const TEXTOS_PADRAO = {
  titulo: "Turnix",
  subtitulo: "Gere relatórios de turno em segundos.",
  tituloDados: "Dados gerais",
  tituloRelatorio: "Relatório gerado",
  prefixoRelatorio: "RELATÓRIO DE TURNO",
  onlines: "Onlines",
  turno: "Turno",
  escala: "Escala",
  data: "Data",
  operacao: "Operação",
  problema: "Problema",
  acoes: "Ações tomadas",
  calibracao: "Calibração",
} as const;
const EQUIPAMENTOS_PADRAO = [
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
] as const;

type Tema = { [Campo in keyof typeof TEMA_PADRAO]: string };
type CampoTema = keyof Tema;
type Equipamento = {
  nome: string;
  operacao: string;
  problema: string;
  acoes: string;
  calibracao: string;
  usaAcoes: boolean;
};
type CampoEquipamento = keyof Equipamento;
type TemaStyle = CSSProperties & Record<`--${string}`, string>;

function carregarLocalStorage<T>(chave: string, padrao: T): T {
  const valorSalvo = localStorage.getItem(chave);

  if (!valorSalvo) {
    return padrao;
  }

  try {
    return { ...padrao, ...JSON.parse(valorSalvo) };
  } catch {
    return padrao;
  }
}

function carregarListaLocalStorage<T>(chave: string, padrao: T[]): T[] {
  const valorSalvo = localStorage.getItem(chave);

  if (!valorSalvo) {
    return padrao;
  }

  try {
    const lista = JSON.parse(valorSalvo);
    return Array.isArray(lista) ? lista : padrao;
  } catch {
    return padrao;
  }
}

export default function App() {
  const [adminAberto, setAdminAberto] = useState(false);
  const [tema, setTema] = useState<Tema>(() =>
    carregarLocalStorage("turnix-tema", TEMA_PADRAO),
  );

  const [dados, setDados] = useState({
    onlines: "",
    turno: "C",
    escala: "19 hrs x 7 hrs",
    data: "2026-05-24",
  });

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() =>
    carregarListaLocalStorage("turnix-equipamentos", [...EQUIPAMENTOS_PADRAO]),
  );

  const [copiado, setCopiado] = useState(false);
  const textos = TEXTOS_PADRAO;

  useEffect(() => {
    localStorage.setItem("turnix-tema", JSON.stringify(tema));
  }, [tema]);

  useEffect(() => {
    localStorage.setItem("turnix-equipamentos", JSON.stringify(equipamentos));
  }, [equipamentos]);

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

  function atualizarEquipamentoAdmin(
    index: number,
    campo: CampoEquipamento,
    valor: string | boolean,
  ) {
    setEquipamentos((lista) =>
      lista.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item,
      ),
    );
  }

  function atualizarTema(campo: CampoTema, valor: string) {
    setTema((atual) => ({ ...atual, [campo]: valor }));
  }

  function adicionarEquipamento() {
    setEquipamentos((lista) => [
      ...lista,
      {
        nome: `Equipamento ${lista.length + 1}`,
        operacao: OPERACAO.OPERANDO,
        problema: NAO_APLICAVEL,
        acoes: NAO_APLICAVEL,
        calibracao: CALIBRACAO.REALIZADA,
        usaAcoes: true,
      },
    ]);
  }

  function removerEquipamento(index: number) {
    setEquipamentos((lista) => lista.filter((_, i) => i !== index));
  }

  function restaurarTema() {
    setTema(TEMA_PADRAO);
  }

  function restaurarTudo() {
    setEquipamentos([...EQUIPAMENTOS_PADRAO]);
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

    linhas.push(`*${textos.prefixoRelatorio} ${dados.turno}*`);
    linhas.push("──────────────────");
    linhas.push(`👤 *${textos.onlines}:* ${dados.onlines || ""}`);
    linhas.push(`🔄 ${textos.turno}: ${dados.turno}`);
    linhas.push(`🕐 ${textos.escala}: ${dados.escala}`);
    linhas.push(`📅 ${textos.data}: ${formatarData(dados.data)}`);
    linhas.push("──────────────────");

    equipamentos.forEach((eq) => {
      linhas.push(`📊 ${eq.nome}`);
      linhas.push(`▪️ ${textos.operacao}: ${statusOperacao(eq.operacao)}`);
      linhas.push(`▪️ ${textos.problema}: ${eq.problema || NAO_APLICAVEL}`);
      if (eq.usaAcoes) {
        linhas.push(`▪️ ${textos.acoes}: ${eq.acoes || NAO_APLICAVEL}`);
      }
      linhas.push(`▪️ ${textos.calibracao}: ${statusCalibracao(eq.calibracao)}`);
      linhas.push("──────────────────");
    });

    return linhas.join("\n");
  }, [dados, equipamentos, textos]);

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

  const coresTurno =
    CORES_TURNO[dados.turno as keyof typeof CORES_TURNO] ?? CORES_TURNO.C;
  const temaStyle: TemaStyle = {
    "--app-bg": tema.fundo,
    "--app-text": tema.texto,
    "--app-primary": tema.primaria,
    "--app-secondary": tema.secundaria,
    "--app-accent": tema.destaque,
    "--app-success": tema.sucesso,
    "--app-alert": tema.alerta,
    "--shift-bg": coresTurno.fundo,
    "--shift-badge-bg": coresTurno.seloFundo,
    "--shift-badge-text": coresTurno.seloTexto,
  };

  return (
    <main
      className={adminAberto ? "app-shell admin-mode" : "app-shell"}
      style={temaStyle}
    >
      <div className="app-container">
        <header className="app-header">
          <div>
            <h1>{textos.titulo}</h1>
            <p>{textos.subtitulo}</p>
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
              <div className="admin-actions">
                <button
                  className="button-secondary"
                  onClick={restaurarTema}
                  type="button"
                >
                  Restaurar cores
                </button>
                <button
                  className="button-secondary"
                  onClick={restaurarTudo}
                  type="button"
                >
                  Restaurar conteúdo
                </button>
              </div>
            </div>

            <div className="admin-block">
              <div className="panel-title-row">
                <h3>Equipamentos</h3>
                <button
                  className="button-primary"
                  onClick={adicionarEquipamento}
                  type="button"
                >
                  Adicionar equipamento
                </button>
              </div>

              <div className="admin-equipment-list">
                {equipamentos.map((eq, index) => (
                  <div className="admin-equipment-card" key={`${eq.nome}-${index}`}>
                    <div className="panel-title-row">
                      <strong>{eq.nome || `Equipamento ${index + 1}`}</strong>
                      <button
                        className="button-danger"
                        onClick={() => removerEquipamento(index)}
                        type="button"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="field-grid">
                      <label className="field">
                        <span>Nome</span>
                        <input
                          value={eq.nome}
                          onChange={(e) =>
                            atualizarEquipamentoAdmin(
                              index,
                              "nome",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="field">
                        <span>Operação inicial</span>
                        <select
                          value={eq.operacao}
                          onChange={(e) =>
                            atualizarEquipamentoAdmin(
                              index,
                              "operacao",
                              e.target.value,
                            )
                          }
                        >
                          <option>{OPERACAO.OPERANDO}</option>
                          <option>{OPERACAO.PARADO}</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Calibração inicial</span>
                        <select
                          value={eq.calibracao}
                          onChange={(e) =>
                            atualizarEquipamentoAdmin(
                              index,
                              "calibracao",
                              e.target.value,
                            )
                          }
                        >
                          <option>{CALIBRACAO.REALIZADA}</option>
                          <option>{CALIBRACAO.NAO_REALIZADA}</option>
                        </select>
                      </label>

                      <label className="field toggle-field">
                        <input
                          checked={eq.usaAcoes}
                          type="checkbox"
                          onChange={(e) =>
                            atualizarEquipamentoAdmin(
                              index,
                              "usaAcoes",
                              e.target.checked,
                            )
                          }
                        />
                        <span>Mostrar ações tomadas</span>
                      </label>

                      <label className="field field-full">
                        <span>Problema inicial</span>
                        <textarea
                          value={eq.problema}
                          onChange={(e) =>
                            atualizarEquipamentoAdmin(
                              index,
                              "problema",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      {eq.usaAcoes && (
                        <label className="field field-full">
                          <span>Ações iniciais</span>
                          <textarea
                            value={eq.acoes}
                            onChange={(e) =>
                              atualizarEquipamentoAdmin(
                                index,
                                "acoes",
                                e.target.value,
                              )
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-block">
              <h3>Cores</h3>
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
            </div>
          </section>
        )}

        <section className="panel">
          <h2>{textos.tituloDados}</h2>

          <label className="field field-full">
            <span>{textos.onlines}</span>
            <input
              value={dados.onlines}
              onChange={(e) => atualizarDados("onlines", e.target.value)}
              placeholder="Ex: Abraão, Estevão"
            />
          </label>

          <div className="field-grid field-grid-three">
            <label className="field">
              <span>{textos.turno}</span>
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
              <span>{textos.escala}</span>
              <input
                value={dados.escala}
                onChange={(e) => atualizarDados("escala", e.target.value)}
              />
            </label>

            <label className="field">
              <span>{textos.data}</span>
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
            key={`${eq.nome}-${index}`}
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
                <span>{textos.operacao}</span>
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
                <span>{textos.calibracao}</span>
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
              <span>{textos.problema}</span>
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
                <span>{textos.acoes}</span>
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
          <h2>{textos.tituloRelatorio}</h2>
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
