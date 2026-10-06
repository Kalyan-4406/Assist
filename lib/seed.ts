import { db, row, run } from "./server";
import { templateCard } from "./domain";
const campusNames = [
  ["vnr-vjiet", "VNR VJIET", "Hyderabad", "Telangana"],
  ["cbit", "CBIT", "Hyderabad", "Telangana"],
  ["jntuh", "JNTUH College of Engineering", "Hyderabad", "Telangana"],
  ["vasavi", "Vasavi College of Engineering", "Hyderabad", "Telangana"],
  ["griet", "GRIET", "Hyderabad", "Telangana"],
  [
    "cv​​r".replaceAll("\u200b", ""),
    "CVR College of Engineering",
    "Hyderabad",
    "Telangana",
  ],
  ["mvsr", "MVSR Engineering College", "Hyderabad", "Telangana"],
  [
    "snist",
    "Sreenidhi Institute of Science and Technology",
    "Hyderabad",
    "Telangana",
  ],
  ["vjit", "Vidya Jyothi Institute of Technology", "Hyderabad", "Telangana"],
  [
    "cmr-cet",
    "CMR College of Engineering and Technology",
    "Hyderabad",
    "Telangana",
  ],
  ["bvrit", "BVRIT Narsapur", "Narsapur", "Telangana"],
  ["jntuk", "JNTUK College of Engineering", "Kakinada", "Andhra Pradesh"],
  ["rvr-jc", "RVR & JC College of Engineering", "Guntur", "Andhra Pradesh"],
  ["gmr-it", "GMR Institute of Technology", "Rajam", "Andhra Pradesh"],
  ["anits", "ANITS", "Visakhapatnam", "Andhra Pradesh"],
  [
    "vr-siddhartha",
    "Velagapudi Ramakrishna Siddhartha Engineering College",
    "Vijayawada",
    "Andhra Pradesh",
  ],
  ["srkr", "SRKR Engineering College", "Bhimavaram", "Andhra Pradesh"],
  [
    "gayatri-vidya",
    "Gayatri Vidya Parishad College of Engineering",
    "Visakhapatnam",
    "Andhra Pradesh",
  ],
  [
    "kl-university",
    "K L Deemed to be University",
    "Vaddeswaram",
    "Andhra Pradesh",
  ],
  ["vit-vellore", "VIT Vellore", "Vellore", "Tamil Nadu"],
  [
    "srm-ktr",
    "SRM Institute of Science and Technology",
    "Kattankulathur",
    "Tamil Nadu",
  ],
  ["ssn", "SSN College of Engineering", "Kalavakkam", "Tamil Nadu"],
  ["psg-tech", "PSG College of Technology", "Coimbatore", "Tamil Nadu"],
  ["kongu", "Kongu Engineering College", "Erode", "Tamil Nadu"],
  [
    "thiagarajar",
    "Thiagarajar College of Engineering",
    "Madurai",
    "Tamil Nadu",
  ],
  ["rvce", "R V College of Engineering", "Bengaluru", "Karnataka"],
  ["bmsce", "BMS College of Engineering", "Bengaluru", "Karnataka"],
  ["msrit", "Ramaiah Institute of Technology", "Bengaluru", "Karnataka"],
  ["pes", "PES University", "Bengaluru", "Karnataka"],
  ["nie-mysore", "National Institute of Engineering", "Mysuru", "Karnataka"],
  ["sit-tumkur", "Siddaganga Institute of Technology", "Tumakuru", "Karnataka"],
  ["vishwakarma", "Vishwakarma Institute of Technology", "Pune", "Maharashtra"],
  ["pict", "Pune Institute of Computer Technology", "Pune", "Maharashtra"],
  ["coep", "COEP Technological University", "Pune", "Maharashtra"],
  ["walchand", "Walchand College of Engineering", "Sangli", "Maharashtra"],
  ["sgsits", "SGSITS", "Indore", "Madhya Pradesh"],
  ["iet-davv", "IET DAVV", "Indore", "Madhya Pradesh"],
  ["lnct", "LNCT", "Bhopal", "Madhya Pradesh"],
  ["kiit", "KIIT Deemed to be University", "Bhubaneswar", "Odisha"],
  ["silicon", "Silicon University", "Bhubaneswar", "Odisha"],
];
const distribution = [26, 18, 14, 11, 9, 8, 7, 6, 5, 4, 4, 3, 2, 2, 1];
const seededDatabases = new WeakMap<D1Database, Promise<void>>();
export function ensureSeed() {
  const database = db();
  let pending = seededDatabases.get(database);
  if (!pending) {
    pending = initializeSeed().catch(error => {
      seededDatabases.delete(database);
      throw error;
    });
    seededDatabases.set(database, pending);
  }
  return pending;
}
async function initializeSeed() {
  if (await row("SELECT value FROM settings WHERE key=?", "seed_v1")) return;
  const now = Date.now(),
    batch: D1PreparedStatement[] = [];
  for (const [slug, name, city, state] of campusNames)
    batch.push(
      db()
        .prepare(
          "INSERT OR IGNORE INTO colleges (id,slug,name,city,state,is_demo,created_at) VALUES (?,?,?,?,?,0,?)",
        )
        .bind(slug, slug, name, city, state, new Date(now).toISOString()),
    );
  for (let i = 0; i < distribution.length; i++)
    for (let j = 0; j < distribution[i]; j++) {
      const id = `demo-${i}-${j}`,
        code = `D${String(i).padStart(2, "0")}${String(j).padStart(3, "0")}`,
        interest = [
          "Placements",
          "Health",
          "Money",
          "Campus life",
          "Agriculture",
          "Gaming",
        ][j % 6],
        branch = ["CSE/IT", "ECE/EEE", "Mech/Civil", "Other"][j % 4];
      const time = new Date(
        now - ((j % 3) * 24 + ((i + j) % 18)) * 3600000,
      ).toISOString();
      batch.push(
        db()
          .prepare(
            "INSERT OR IGNORE INTO registrations (id,name,email,college_id,branch,year,idea_text,build_card,own_code,ref_code,angle,is_ambassador,is_demo,readiness,consent_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          )
          .bind(
            id,
            `Demo${String(j + 1).padStart(2, "0")} ${String.fromCharCode(65 + i)}`,
            id + "@example.invalid",
            campusNames[i][0],
            branch,
            "Final year",
            interest,
            JSON.stringify(templateCard(interest, branch)),
            code,
            j > 0 && j % 4 === 0 ? `D${String(i).padStart(2, "0")}000` : null,
            ["R", "P", "F"][j % 3],
            j === 0 ? 1 : 0,
            1,
            JSON.stringify({
              laptop: j % 2 === 0,
              account: j % 3 === 0,
              repo: j % 4 === 0,
            }),
            time,
            time,
          ),
      );
      for (const type of [
        "view_college",
        "start_register",
        "card_shown",
        "submit",
      ])
        batch.push(
          db()
            .prepare(
              "INSERT OR IGNORE INTO events (id,type,college_id,ref_code,session_id,is_demo,created_at) VALUES (?,?,?,?,?,1,?)",
            )
            .bind(id + "-" + type, type, campusNames[i][0], null, id, time),
        );
    }
  // Fictional incomplete funnel sessions make the dashboard a useful simulation.
  for (let j = 0; j < 160; j++)
    for (const type of j < 30
      ? ["view_college", "start_register", "card_shown"]
      : j < 70
        ? ["view_college", "start_register"]
        : ["view_college"])
      batch.push(
        db()
          .prepare(
            "INSERT OR IGNORE INTO events (id,type,college_id,ref_code,session_id,is_demo,created_at) VALUES (?,?,?,?,?,1,?)",
          )
          .bind(
            `demo-drop-${j}-${type}`,
            type,
            campusNames[j % 15][0],
            null,
            `demo-drop-${j}`,
            new Date(now - j * 900000).toISOString(),
          ),
      );
  // D1 batches are bounded. Idempotent IDs/unique emails keep parallel first requests safe.
  for (let i = 0; i < batch.length; i += 80)
    await db().batch(batch.slice(i, i + 80));
  await run(
    "INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)",
    "hide_demo",
    "0",
  );
  await run(
    "INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)",
    "seed_v1",
    "1",
  );
}
