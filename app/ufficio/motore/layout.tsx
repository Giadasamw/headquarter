// Layout della stanza Motore.
// "pannello" è uno spazio extra (slot) in cui si aprono i pannelli pop-up
// (scrivania, lavagna, ...) sopra l'immagine della stanza, senza lasciarla.
// I file del pop-up stanno nella cartella @pannello.
export default function MotoreLayout({ children, pannello }: LayoutProps<'/ufficio/motore'>) {
  return (
    <>
      {children}
      {pannello}
    </>
  )
}
