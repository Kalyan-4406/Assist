// Alternative server-side transport; not active in the deployed D1 build.
// Never instantiate this adapter with a service key in browser code.
import type {Registration} from './types';
export function createSupabaseAdapter(url:string,serviceKey:string){
 if(!url.startsWith('https://')||!serviceKey)throw new Error('Configure the Supabase URL and server-only service key.');
 async function request<T>(table:string,query:string,method='GET',body?:unknown):Promise<T>{
  const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/${table}${query?'?'+query:''}`,{method,headers:{apikey:serviceKey,authorization:'Bearer '+serviceKey,'content-type':'application/json',prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  if(!response.ok)throw new Error(`Supabase ${method} failed with status ${response.status}.`);
  return await response.json() as T;
 }
 const eq=(s:string)=>encodeURIComponent(s);
 return {
  readCollegeCounts:()=>request<unknown[]>('college_counts','select=*'),
  readRace:()=>request<unknown[]>('race_board','select=*&order=rank.asc'),
  findRegistrationByEmail:async(email:string)=>(await request<Registration[]>('registrations','select=*&email=eq.'+eq(email.trim().toLowerCase())+'&limit=1'))[0]??null,
  insertRegistration:(record:Record<string,unknown>)=>request<Registration[]>('registrations','','POST',record),
  saveReadiness:(registrationId:string,readiness:Record<string,boolean>)=>request<Registration[]>('registrations','id=eq.'+eq(registrationId),'PATCH',{readiness}),
  recordEvent:(record:Record<string,unknown>)=>request<unknown[]>('events','','POST',record),
  recordModelCall:(record:Record<string,unknown>)=>request<unknown[]>('llm_calls','','POST',record),
 };
}
