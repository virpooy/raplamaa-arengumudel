// Lukustab ehitatud lehe: node tools/lock.mjs <avatud.html> <lukk.json> <väljund.html>
//
// Skeem (salasõna ei ole kunagi repos ega GitHub Actionsis):
//   lukk.json (avalik) = RSA-OAEP avalik võti + RSA salajane võti, mis on krüpteeritud salasõnast tuletatud võtmega
//                        (PBKDF2-SHA256 -> AES-GCM). Loob seadista-salasona.html kasutaja brauseris.
//   Iga ehitus: juhuslik sisuvõti K (AES-256-GCM) krüpteerib gzip-itud lehe; K krüpteeritakse avaliku võtmega.
//   Brauseris: salasõna -> PBKDF2 -> avab salajase võtme -> avab K -> avab lehe.
// Nii saab automaatne uuendamine lehe lukustada ilma salasõna teadmata.
import fs from "node:fs";
import zlib from "node:zlib";
import { webcrypto as wc } from "node:crypto";

const [, , inp, lockPath, outp] = process.argv;
if (!inp || !lockPath || !outp) { console.error("Kasutus: node tools/lock.mjs <avatud.html> <lukk.json> <väljund.html>"); process.exit(1); }
const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
if (lock.v !== 1 || !lock.pub || !lock.priv || !lock.kdf) throw new Error("lukk.json vorming ei sobi");
const b64 = (u8) => Buffer.from(u8).toString("base64");

const plain = fs.readFileSync(inp);
const gz = zlib.gzipSync(plain, { level: 9 });
const K = await wc.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
const iv = wc.getRandomValues(new Uint8Array(12));
const ct = new Uint8Array(await wc.subtle.encrypt({ name: "AES-GCM", iv }, K, gz));
const pub = await wc.subtle.importKey("spki", Buffer.from(lock.pub, "base64"), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
const rawK = new Uint8Array(await wc.subtle.exportKey("raw", K));
const wk = new Uint8Array(await wc.subtle.encrypt({ name: "RSA-OAEP" }, pub, rawK));

const box = { v: 1, kdf: lock.kdf, priv: lock.priv, wk: b64(wk), iv: b64(iv) };
const tpl = fs.readFileSync(new URL("./lock_template.html", import.meta.url), "utf8");
const html = tpl.replace("/*@BOX*/null", () => JSON.stringify(box)).replace("@PAYLOAD@", () => b64(ct));
fs.writeFileSync(outp, html);
console.log(`lukustatud: ${(plain.length / 1e6).toFixed(2)} MB -> ${(html.length / 1e6).toFixed(2)} MB`);
