import { useMemo } from "react"

function splitChars(text: string) {
  return text.split("").filter(c => /[a-zA-Z]/.test(c));
}

function normalize(text:string) {
  return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function useEnegrem(text: string, enegrem: string) {
  return useMemo(() => {
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
}

