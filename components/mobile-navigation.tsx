"use client";
import {useEffect,useState} from "react";
import {Menu,X} from "lucide-react";
export function MobileNavigation(){
  const [open,setOpen]=useState(false),[hydrated,setHydrated]=useState(false);
  useEffect(()=>setHydrated(true),[]);
  return <div className="mobile-menu" onKeyDown={e=>{if(e.key==="Escape"){setOpen(false);e.currentTarget.querySelector<HTMLButtonElement>('button')?.focus();}}}>
    <button className="icon-button" disabled={!hydrated} aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
    {open&&<nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[["/","Find your college"],["/race","The race"],["/plan","Growth plan"],["/ops","Growth desk"],["/submission","Submission kit"]].map(([href,label])=><a key={href} href={href}>{label}</a>)}</nav>}
  </div>;
}
