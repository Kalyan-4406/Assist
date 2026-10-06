'use client';
import {Moon,Sun} from 'lucide-react';
import {useEffect,useState} from 'react';
export function ThemeToggle(){const [dark,setDark]=useState(false);useEffect(()=>{const d=localStorage.getItem('cbr_theme')==='dark';document.documentElement.dataset.theme=d?'dark':'light';setDark(d);},[]);return <button className="icon-button" aria-label={dark?'Use light theme':'Use dark theme'} onClick={()=>{setDark(!dark);document.documentElement.dataset.theme=dark?'light':'dark';localStorage.setItem('cbr_theme',dark?'light':'dark');}}>{dark?<Sun size={20}/>:<Moon size={20}/>}</button>;}
