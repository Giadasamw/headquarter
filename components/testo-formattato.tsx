import Markdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import styles from './sophie.module.css'

// Mostra il testo di Sophie con la formattazione vera (grassetto, corsivo,
// elenchi, titoletti, linee) invece degli asterischi e dei cancelletti.
// Un semplice "a capo" resta un a capo, come prima. I link si aprono in una nuova scheda.
export function TestoFormattato({ testo }: { testo: string }) {
  return (
    <div className={styles.formattato}>
      <Markdown
        remarkPlugins={[remarkBreaks]}
        components={{
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
        }}
      >
        {testo}
      </Markdown>
    </div>
  )
}
