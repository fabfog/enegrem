import { useMemo, useState } from "react"
import { Textarea } from "./components/ui/textarea";
import { clsx } from "clsx";

function splitChars(text: string) {
  return text.split("").filter(c => /[a-zA-Z]/.test(c));
}

function normalize(text:string) {
  return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function App() {
  const [text, setText] = useState("");
  const [enegrem, setenegrem] = useState("");

  const { diff, isComplete, textRemainingLetters } = useMemo(() => {
    const normalizedenegrem = normalize(enegrem);
    const normalizedText = normalize(text);

    const enegremLetters = splitChars(normalizedenegrem).sort();
    const textLetters = splitChars(normalizedText).sort();

    const textRemainingLetters: Array<string | null> = splitChars(normalizedText);
    enegremLetters.forEach(c => {
      const indexOfChar = textRemainingLetters.findIndex(l => l === c);
      if (indexOfChar > -1) {
        textRemainingLetters[indexOfChar] = null;
      }
    })

    const diff: Record<string, number> = {};
    textLetters.forEach(c => {
      if (diff[c] === undefined) {
        diff[c] = 0;
      } 
      diff[c] += 1
    });
    enegremLetters.forEach(c => {
      if (diff[c] === undefined) {
        diff[c] = 0;
      } 
      diff[c] -= 1
    });

    const isComplete = text.length > 0 && Object.values(diff).every(v => v === 0)

    return {
      enegremLetters,
      textRemainingLetters,
      textLetters,
      diff,
      isComplete,
    }
  }, [text, enegrem])

  return (
    <div className="flex flex-col gap-8 items-center justify-center container max-w-lg mx-auto mt-8">
      <h1 className="text-3xl font-bold text-red-400">
        ENEGREM
      </h1>
      <Textarea placeholder="Insert text (i.e. Codroipo)" className="text-lg min-h-24" value={text} onChange={(e) => setText(e.target.value)} />
      {isComplete ? <h2 className="text-xl font-bold text-green-500 py-[3px]">ENEGREM COMPLETED!</h2> : <>
        <ul className="flex items-center gap-2 flex-wrap">
          {Object.entries(diff).map(([letter, value]) => (
            <li
              className={clsx(
                "border pl-3 pr-2 py-1 gap-1 rounded-full whitespace-nowrap flex items-center",
                value === 0 && "bg-green-200 opacity-75",
                value < 0 && "bg-red-200"
              )}
              key={letter}
            >
              <strong>{letter}</strong> : <div className="min-w-[2ch] text-center">{value > 100 ? "99+" : value}</div>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap items-center gap-1">
          {textRemainingLetters.map((l, i) => <li key={i}>{l === null ? "_" : l}</li>)}
        </ul>
      </>}

      <Textarea disabled={!text} className="text-lg min-h-24" value={enegrem} onChange={(e) => setenegrem(e.target.value)} />
    </div>
  )
}

export default App
