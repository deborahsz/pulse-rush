import { useEffect, useState } from "react";

export function usePulseEvent(name) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const update = () => setRevision((value) => value + 1);
    window.addEventListener(`pulse:${name}`, update);
    return () => window.removeEventListener(`pulse:${name}`, update);
  }, [name]);

  return revision;
}