import { useEffect, useMemo, useState } from "react"
import { Textarea } from "./components/ui/textarea";
import { clsx } from "clsx";
import Logo from './assets/logo.svg';
import { Button } from "./components/ui/button";
import { CheckCircledIcon, Link1Icon } from "@radix-ui/react-icons";

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

  const { diff, isComplete, textRemainingLetters, enegremSurplusLetters } = useMemo(() => {
    const normalizedEnegrem = normalize(enegrem);
    const normalizedText = normalize(text);

    const enegremLetters = splitChars(normalizedEnegrem).sort();
    const textLetters = splitChars(normalizedText).sort();

    const textRemainingLetters: Array<string | null> = splitChars(normalizedText);
    enegremLetters.forEach(c => {
      const indexOfChar = textRemainingLetters.findIndex(l => l === c);
      if (indexOfChar > -1) {
        textRemainingLetters[indexOfChar] = null;
      }
    })

    const enegremSurplusLetters: Array<string | null> = splitChars(normalizedEnegrem);
    textLetters.forEach(c => {
      const indexOfChar = enegremSurplusLetters.findIndex(l => l === c);
      if (indexOfChar > -1) {
        enegremSurplusLetters[indexOfChar] = null;
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
      enegremSurplusLetters,
      textLetters,
      diff,
      isComplete,
    }
  }, [text, enegrem])

  return (
    <div className="flex flex-col p-4 gap-4 items-center justify-center container max-w-lg mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-2 justify-between w-full">
        <Logo />
        ENEGREM
        <div className="invisible"><Logo /></div>
      </h1>
      <Textarea placeholder="Insert text (i.e. Codroipo)" className="text-lg min-h-40" value={text} onChange={(e) => setText(e.target.value)} />
     
      <ul className="grid gap-1 grid-cols-5 sm:grid-cols-6 lg:grid-cols-7">
        {Object.entries(diff).map(([letter, value]) => (
          <li
            className={clsx(
              "border pl-2 pr-1 py-1 gap-1 min-w-16 rounded-full whitespace-nowrap",
              "flex justify-center items-center",
              "text-sm md:text-base border",
              value === 0 && "border-green-500 bg-green-50 opacity-75",
              value < 0 && "bg-red-200"
            )}
            key={letter}
          >
            <strong>{letter}</strong> : <div className="min-w-[2ch] text-center">
              {value > 100 ? "99+" : value === 0 ? <CheckCircledIcon width={24} height={24} className="text-green-500" /> : value}
            </div>
          </li>
        ))}
        </ul>
        {isComplete ? (
          <h2 className="text-xl font-bold text-green-500">ENEGREM COMPLETED!</h2> 
        ) : (
          <ul className="flex flex-wrap text-sm items-center gap-2 py-[2px]">
            {textRemainingLetters.map((l, i) => <li key={i}>{l === null ? "_" : l}</li>)}
            {enegremSurplusLetters.filter(Boolean).map((l, i) => <li className="text-red-500" key={i}>{l}</li>)}
          </ul>
        )}

      <Textarea disabled={!text} className="text-lg min-h-40" value={enegrem} onChange={(e) => setEnegrem(e.target.value)} />
        
      <Button
        variant="secondary"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert("Copied!");
        }}
        type="button"
      >
        <Link1Icon />
        Copy link to this enegrem
      </Button>
    </div>
  )
}

export default App
