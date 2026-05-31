type CatastroSummaryProps = {
  withCatastro: number;
  mapped: number;
  total?: number;
};

export function CatastroSummary({ withCatastro, mapped, total }: CatastroSummaryProps) {
  const cards = [
    {
      label: "Catastro-data",
      value: withCatastro,
      text: "tomter med Catastro, polígono eller parcela",
      badge: "REF",
    },
    {
      label: "Kartposisjon",
      value: mapped,
      text: "tomter med koordinater og markør i kartet",
      badge: "MAP",
    },
    {
      label: "Kartlag",
      value: "WMS",
      text: "offentlig Catastro-kartlag med parcelgrenser",
      badge: "WMS",
    },
  ];

  return (
    <section className="catastro-summary-pro" aria-label="Catastro-funksjoner">
      <div className="catastro-summary-pro__header">
        <div>
          <p>Catastro oversikt</p>
          <h2>Dokumentasjon og kartgrunnlag for tomtene</h2>
        </div>
        {typeof total === "number" && <span>{total} tomter vist</span>}
      </div>

      <div className="catastro-summary-pro__grid">
        {cards.map((card) => (
          <article key={card.label}>
            <span className="catastro-summary-pro__badge">{card.badge}</span>
            <strong>{card.value}</strong>
            <p>{card.label}</p>
            <small>{card.text}</small>
          </article>
        ))}
      </div>

      <style>{`
        .catastro-summary-pro {
          width: min(1220px, calc(100% - 48px));
          margin: -42px auto 0;
          position: relative;
          z-index: 5;
          padding: 22px;
          border: 1px solid rgba(185, 147, 90, 0.22);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 22px 70px rgba(22, 34, 43, 0.14);
          backdrop-filter: blur(14px);
        }

        .catastro-summary-pro__header {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .catastro-summary-pro__header p {
          margin: 0 0 4px;
          color: #b9935a;
          font-size: 0.76rem;
          font-weight: 900;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .catastro-summary-pro__header h2 {
          margin: 0;
          color: #171e3a;
          font-size: clamp(1.2rem, 2vw, 1.7rem);
        }

        .catastro-summary-pro__header > span {
          white-space: nowrap;
          padding: 9px 12px;
          border-radius: 999px;
          background: #f8f8f3;
          color: #617084;
          font-weight: 900;
          font-size: 0.82rem;
        }

        .catastro-summary-pro__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .catastro-summary-pro article {
          position: relative;
          min-height: 142px;
          padding: 18px;
          border: 1px solid rgba(22, 34, 43, 0.08);
          border-radius: 14px;
          background: linear-gradient(145deg, #ffffff, #f8f8f3);
          overflow: hidden;
        }

        .catastro-summary-pro article::after {
          content: "";
          position: absolute;
          right: -42px;
          top: -42px;
          width: 116px;
          height: 116px;
          border-radius: 999px;
          background: rgba(185, 147, 90, 0.12);
        }

        .catastro-summary-pro__badge {
          display: inline-flex;
          min-width: 42px;
          height: 30px;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          border-radius: 999px;
          background: #171e3a;
          color: white;
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.8px;
        }

        .catastro-summary-pro strong {
          display: block;
          margin-top: 16px;
          color: #171e3a;
          font-size: clamp(2rem, 4vw, 3.1rem);
          line-height: 1;
        }

        .catastro-summary-pro article p {
          margin: 10px 0 4px;
          color: #171e3a;
          font-weight: 900;
        }

        .catastro-summary-pro small {
          color: #617084;
          line-height: 1.5;
          font-weight: 700;
        }

        @media (max-width: 820px) {
          .catastro-summary-pro {
            margin-top: -20px;
          }

          .catastro-summary-pro__header {
            flex-direction: column;
          }

          .catastro-summary-pro__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
