import Link from 'next/link';
import {Flag,ArrowUpRight} from 'lucide-react';
import {ThemeToggle} from './theme-toggle';
import {MobileNavigation} from './mobile-navigation';
export function Header(){return <header className="header"><Link prefetch={false} href="/" className="brand"><span className="brand-mark"><Flag size={22} fill="currentColor"/></span><span>Campus Build Race</span></Link><nav aria-label="Main navigation"><Link prefetch={false} href="/">Find your college</Link><Link prefetch={false} href="/race">The race</Link><Link prefetch={false} href="/plan">Growth plan</Link><Link prefetch={false} href="/ops">Growth desk <ArrowUpRight size={14}/></Link></nav><div className="header-actions"><ThemeToggle/><MobileNavigation/></div></header>;}
export function DemoBanner({hidden=false}:{hidden?:boolean}){return <div className="demo-banner">{hidden?'Demo data hidden — showing live registrations only.':'Demo data — a working simulation. No student outreach.'}</div>;}
export function Footer(){return <footer className="footer"><span>One hour. One project. Yours.</span><div><Link prefetch={false} href="/privacy">Privacy & consent</Link><Link prefetch={false} href="/submission">Submission kit</Link><span>NxtWave challenge · independent simulation</span></div></footer>;}
