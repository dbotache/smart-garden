"use client";

import { createContext, useContext } from "react";

export const SlideMetaContext = createContext<{ number: number; total: number }>({ number: 1, total: 1 });
export const useSlideMeta = () => useContext(SlideMetaContext);
