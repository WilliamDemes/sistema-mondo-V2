"use client";

import { useState, useEffect } from "react";
import { Activity, ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Link from "next/link";
import styles from "./Home.module.css";
import { ALL_FAKE_DATA, type DashboardItem } from "./fakeData";
import { title } from "process";


export default function CalendarClientUI() {

  // ------  DADOS DO BANCO DE DADOS -----
  // 1. O Estado: começa como uma lista vazi, preparada para receber as ações
  const [atividades, setAtividades] = useState<any[]>([])   // avisa o sistema que vamos guardar uma lista de coisas variadas ali dentro

  // 2. O Efeito: o "entregador" que vai buscar os dados quando a página abre
  useEffect(() => {
    async function buscarAtividades() {
      try {
        const resposta = await fetch("/api/home")   // O nosso caminho absoluto!
        if (resposta.ok) {
          const dados = await resposta.json();
          setAtividades(dados);   // Guardamos a caixa de dados no nosso estado

          // 1. Criamos o nosso mapa de eventos reais
          const eventosReais = {};

          dados.forEach((acao) => {
            // Cortamos a data para ficar no formato de calendario "YYY-MM-DD"
            const dataFormatada = acao.date.split("T")[0];

            if (!eventosReais[dataFormatada]) {
              eventosReais[dataFormatada] = [];
            }

            // 2. Inserimos a ação no dia correto
            eventosReais[dataFormatada].push({
              title: acao.nomeAcao,
              category: acao.tipo
            });
          });

          // 3. Atualizamos o calendário na tela!
          setCalendarEvents(eventosReais);
        }
      } catch (erro) {
        console.error("Erro ao buscar atividades: ", erro);
      }
    }

    buscarAtividades();
  }, []); // Este array vazio é crucial: garante que só pose dados uma vez!

  // ----------- FIM DOS DADOS DO BANCO DE DADOS --------------



  const [currentDate, setCurrentDate] = useState(new Date());

  // Fake stream integration FAKE FAKE FAKE
  const [recentActions, setRecentActions] = useState<DashboardItem[]>([]);

  // Modal registration FAKE FAKE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayToBook, setSelectedDayToBook] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Atividades");

  // Fake events per day format: { '2026-04-15': [ { title: 'Reunião', category: 'Ativos' } ] }
  const [calendarEvents, setCalendarEvents] = useState<Record<string, Array<{ title: string, category: string }>>>({});

  // FAKE initialization
  useEffect(() => {
    // Populate fake initial events based on current ALL_FAKE_DATA mapped to the current displayed month
    const fakeEventsMap: Record<string, Array<{ title: string, category: string }>> = {};
    ALL_FAKE_DATA.slice(0, 50).forEach(item => {
      if (!fakeEventsMap[item.date]) fakeEventsMap[item.date] = [];
      fakeEventsMap[item.date].push({ title: item.title, category: item.category });
    });
    setCalendarEvents(fakeEventsMap);

    const stream = [...ALL_FAKE_DATA].slice(0, 5);
    setRecentActions(stream);

    const int = setInterval(() => {
      setRecentActions((prev) => {
        const randomIndex = Math.floor(Math.random() * 50);
        const randomItem = ALL_FAKE_DATA[5 + randomIndex];
        if (!randomItem) return prev;
        const FAKE_NEW_ITEM = {
          ...randomItem,
          id: `recent-${Date.now()}`,
          description: "(Atualização) " + randomItem.description,
          date: new Date().toISOString().split("T")[0]
        };
        return [FAKE_NEW_ITEM, ...prev].slice(0, 5);
      });
    }, 15000);

    return () => clearInterval(int);
  }, []);

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handleDayClick = (dayPosition: number) => {
    setSelectedDayToBook(dayPosition);
    setIsModalOpen(true);
  };

  const handleSubmitFakeAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayToBook) return;

    const dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDayToBook.toString().padStart(2, '0')}`;

    // Create new event
    const newEvt = { title: formTitle, category: formCategory };
    setCalendarEvents(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvt]
    }));

    // Prepend to stream actions
    const FAKE_NEW_ITEM: DashboardItem = {
      id: `recent-modal-${Date.now()}`,
      category: formCategory,
      title: "Nova: " + formTitle,
      date: dateKey,
      description: "Agendado via calendário oficial."
    };
    setRecentActions(prev => [FAKE_NEW_ITEM, ...prev].slice(0, 5));

    setIsModalOpen(false);
    setFormTitle("");
  };

  // Render Days
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const actualDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Trailing blanks to complete the last row of 7 days
  const totalCellsSoFar = blankDays.length + actualDays.length;
  const remainder = totalCellsSoFar % 7;
  const trailingBlanksCount = remainder === 0 ? 0 : 7 - remainder;
  const trailingBlankDays = Array.from({ length: trailingBlanksCount }, (_, i) => i);

  return (
    <div className={styles["calendar-ui-wrapper"]}>
      {/* ── Calendar Section ── */}
      <section className={styles["calendar-card"]}>
        <div className={styles["calendar-header"]}>
          <div className={styles["cal-title-box"]}>
            <CalendarIcon size={24} color="#C9943E" />
            <h2 className={styles["cal-title"]}>
              Agenda da Equipe
              <span className={styles["cal-month-year"]}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            </h2>
          </div>
          <div className={styles["cal-controls"]}>
            <button onClick={prevMonth} className={styles["cal-btn"]}><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className={styles["cal-btn"]}><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className={styles["cal-grid"]}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className={styles["cal-head-day"]}>{day}</div>
          ))}

          {blankDays.map(b => <div key={`blank-${b}`} className={styles["cal-cell-blank"]}></div>)}

          {actualDays.map(day => {
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            const dateKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayEvents = calendarEvents[dateKey] || [];

            return (
              <div
                key={day}
                className={`${styles["cal-cell"]} ${isWeekend ? styles["cal-cell-weekend"] : ''} ${isToday ? styles["cal-cell-today"] : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className={styles["cal-day-num"]}>{day}</div>
                <div className={styles["cal-dots-wrap"]}>
                  {dayEvents.map((e, idx) => {
                    // Color mapping based on category FAKE FAKE
                    let bgColor = "#E8D5C0";
                    let textColor = "#491B02";
                    if (e.category === "Atividades") { bgColor = "#00999920"; textColor = "#009999"; }
                    if (e.category === "Doação") { bgColor = "#8E44AD20"; textColor = "#8E44AD"; }
                    if (e.category === "Consultoria") { bgColor = "#34495E20"; textColor = "#34495E"; }
                    if (e.category === "Cursos") { bgColor = "#2980B920"; textColor = "#2980B9"; }
                    if (e.category === "Atendimentos") { bgColor = "#C0272D20"; textColor = "#C0272D"; }

                    return (
                      <div key={idx} className={styles["cal-event-pill"]} style={{ background: bgColor, color: textColor }}>
                        {e.title}
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}

          {trailingBlankDays.map(b => <div key={`trail-blank-${b}`} className={styles["cal-cell-blank"]}></div>)}
        </div>
      </section>

      {/* ── Recent Actions Simulated (Live) ── */}
      <section className={styles["home-families"]} id="recent-actions">
        <div className={styles["home-families-header"]}>
          <h2 className={styles["home-families-title"]}>
            <Activity size={20} color="#059669" />
            Últimas Ações <span className={styles["live-indicator"]}></span>
          </h2>
          <Link href="/atividades" className={styles["home-families-add"]} style={{ background: '#6B7F3E' }}>
            Ver Todas <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles["home-families-list"]}>
          {recentActions.map((action) => (
            <div key={action.id} className={styles["family-row"]}>
              <div className={styles["family-row-info"]}>
                <span className={styles["family-row-name"]}>{action.title}</span>
                <span className={styles["family-row-territory"]}>{new Date(action.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })} • {action.description}</span>
              </div>
              <span className={styles["category-badge"]}>{action.category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Modal FAKE Agendamento */}
      {isModalOpen && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal-box"]}>
            <div className={styles["modal-header"]}>
              <h3>Agendar para {selectedDayToBook} de {monthNames[currentDate.getMonth()]}</h3>
              <button className={styles["modal-close"]} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitFakeAction} className={styles["modal-form"]}>
              <div className={styles["modal-field"]}>
                <label>Título da Ação/Evento</label>
                <input required autoFocus value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex: Entrega de Cestas" />
              </div>
              <div className={styles["modal-field"]}>
                <label>Categoria Simbólica</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                  <option>Atividades</option>
                  <option>Doação</option>
                  <option>Consultoria</option>
                  <option>Cursos</option>
                  <option>Atendimentos</option>
                </select>
              </div>
              <button type="submit" className={styles["modal-submit"]}>
                <Plus size={16} /> Confirmar Agendamento Falso
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
