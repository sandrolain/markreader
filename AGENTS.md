# AGENTS.md

## Scope

Questo repository contiene MarkReader, un visualizzatore Markdown browser-based per documentazione e siti semplici.

## Linee guida operative

- usare Bun per installare dipendenze ed eseguire script (`bun install`, `bun run <script>`);
- preferire TypeScript e API moderne del browser;
- mantenere compatibilità con il rendering Markdown esistente e con il routing hash;
- evitare regressioni nella navigazione tra documenti e nella lettura dei file di configurazione;
- mantenere i file di documentazione sincronizzati con il comportamento effettivo del progetto.

## Modifiche richieste

- per nuove funzionalità, preferire piccoli passi verificabili;
- per file nuovi, usare il meccanismo di creazione file del workspace;
- per modifiche a file esistenti, preferire edit mirati invece di riscrivere interi blocchi;
- documentare eventuali cambiamenti rilevanti in README o nella documentazione presente.

## Verifiche consigliate

Prima di considerare una modifica completa, verificare almeno:

- `bun run build`
- `bun run test` (quando il setup Vitest sarà disponibile)

## Note di progetto

- la logica principale è concentrata in `src/`;
- i contenuti demo/documentazione vivono in `docs/`;
- il progetto è pensato per essere semplice, leggero e senza dipendenze da static site generator.
