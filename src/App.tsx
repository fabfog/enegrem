import { useEffect, useMemo, useState } from "react"
import { Textarea } from "./components/ui/textarea";
import { clsx } from "clsx";

function splitChars(text: string) {
  return text.split("").filter(c => /[a-zA-Z]/.test(c));
}

function normalize(text:string) {
  return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}
const textQueryParamKey = "t";
const enegremQueryParamKey = "e";

function App() {
  const href = window.location.href;
  const url = useMemo(() => new URL(href), [href]);

  const [text, setText] = useState(url.searchParams.get(textQueryParamKey) ?? "");
  const [enegrem, setEnegrem] = useState(url.searchParams.get(enegremQueryParamKey) ?? "");

  useEffect(() => {
    if (text) {
      url.searchParams.set(textQueryParamKey, text);
    } else {
      url.searchParams.delete(textQueryParamKey)
    }
    if (enegrem) {
      url.searchParams.set(enegremQueryParamKey, enegrem);
    } else {
      url.searchParams.delete(enegremQueryParamKey)
    }
    window.history.pushState(null, '', url.toString());
  }, [enegrem, text, url]);

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
        {isComplete ? (
          <h2 className="text-xl font-bold text-green-500">ENEGREM COMPLETED!</h2> 
        ) : (
          <ul className="flex flex-wrap items-center gap-1 py-[2px]">
            {textRemainingLetters.map((l, i) => <li key={i}>{l === null ? "_" : l}</li>)}
          </ul>
        )}

      <Textarea disabled={!text} className="text-lg min-h-24" value={enegrem} onChange={(e) => setEnegrem(e.target.value)} />
    </div>
  )
}

export default App
