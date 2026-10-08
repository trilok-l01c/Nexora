"use client";

import { useEffect, useState } from "react";
import { useAdminData } from "../AdminDataContext";
import type { HomeContent } from "../../homeContent";
import { Alert } from "../components/primitives";
import styles from "../workspace.module.css";

type Section = "hero" | "intro" | "services" | "story" | "work" | "reasons";
const tabs: [Section, string][] = [["hero", "Hero"], ["intro", "Introduction"], ["services", "Services"], ["story", "Story"], ["work", "Work"], ["reasons", "Reasons"]];

export default function SiteContentSection() {
    const { homeContent, setHomeContent, saveHomeContent, loadHomeContent, loading, errors } = useAdminData();
    const [section, setSection] = useState<Section>("hero");
    const [message, setMessage] = useState("");
    useEffect(() => { void loadHomeContent().catch(() => undefined); }, [loadHomeContent]);
    const update = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) => setHomeContent(current => ({ ...current, [key]: value }));
    const save = async () => { setMessage(""); try { await saveHomeContent(); setMessage("Homepage content saved and published."); } catch { /* Context displays the error. */ } };

    return <div className={styles.stack}>
        <header className={styles.pageHeader}><div><p className={styles.pageKicker}>Public website</p><h1 className={styles.pageTitle}>Homepage content</h1><p className={styles.pageSubtitle}>Edit the sections that appear on the current homepage. Saving publishes the same content visitors see.</p></div><div className={styles.headerActions}><button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => void loadHomeContent()} disabled={loading.home}>{loading.home ? "Loading..." : "Reload"}</button><button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => void save()} disabled={loading.home}>{loading.home ? "Saving..." : "Save & publish"}</button></div></header>
        {errors.home ? <Alert tone="red">{errors.home}</Alert> : null}{message ? <Alert tone="green">{message}</Alert> : null}
        <nav className={styles.tabs} aria-label="Homepage sections">{tabs.map(([key, label]) => <button key={key} type="button" className={`${styles.tab} ${section === key ? styles.tabActive : ""}`} onClick={() => setSection(key)}>{label}</button>)}</nav>
        <section className={styles.panel}><div className={styles.panelBody}>
            {section === "hero" ? <Collection label="Hero slides" items={homeContent.heroSlides} onChange={(heroSlides) => update("heroSlides", heroSlides)} fields={["phrase", "image", "alt"]} /> : null}
            {section === "intro" ? <Fields value={homeContent.intro} onChange={(intro) => update("intro", intro)} multiline={["text"]} /> : null}
            {section === "services" ? <Collection label="Service cards" items={homeContent.services} onChange={(services) => update("services", services)} fields={["title", "text", "image", "alt"]} multiline={["text"]} /> : null}
            {section === "story" ? <Fields value={homeContent.story} onChange={(story) => update("story", story)} multiline={["text"]} /> : null}
            {section === "work" ? <div className={styles.stack}><Fields value={{ kicker: homeContent.work.kicker, title: homeContent.work.title, linkLabel: homeContent.work.linkLabel }} onChange={(value) => update("work", { ...homeContent.work, ...value })} /><h3 className={styles.panelTitle}>Primary feature</h3><Fields value={homeContent.work.primary} onChange={(primary) => update("work", { ...homeContent.work, primary })} multiline={[]} /><h3 className={styles.panelTitle}>Secondary feature</h3><Fields value={homeContent.work.secondary} onChange={(secondary) => update("work", { ...homeContent.work, secondary })} multiline={[]} /></div> : null}
            {section === "reasons" ? <div className={styles.stack}><Fields value={{ kicker: homeContent.reasons.kicker }} onChange={(value) => update("reasons", { ...homeContent.reasons, ...value })} /><Collection label="Reason cards" items={homeContent.reasons.items} onChange={(items) => update("reasons", { ...homeContent.reasons, items })} fields={["title", "text"]} multiline={["text"]} /></div> : null}
        </div></section>
    </div>;
}

function Fields<T extends Record<string, string>>({ value, onChange, multiline = [] as string[] }: { value: T; onChange: (value: T) => void; multiline?: string[] }) {
    return <div className={styles.editorGrid}>{Object.entries(value).map(([key, text]) => <label className={styles.field} key={key}><span className={styles.fieldLabel}>{key.replace(/([A-Z])/g, " $1")}</span>{multiline.includes(key) ? <textarea className={styles.textarea} rows={3} value={text} onChange={(event) => onChange({ ...value, [key]: event.target.value })} /> : <input className={styles.input} value={text} onChange={(event) => onChange({ ...value, [key]: event.target.value })} />}</label>)}</div>;
}

function Collection<T extends Record<string, string>>({ label, items, onChange, fields, multiline = [] }: { label: string; items: T[]; onChange: (items: T[]) => void; fields: (keyof T)[]; multiline?: (keyof T)[] }) {
    return <div className={styles.stackTight}>{items.map((item, index) => <section className={styles.panel} key={index}><div className={styles.panelHeader}><h3 className={styles.panelTitle}>{label.slice(0, -1)} {index + 1}</h3><button type="button" className={`${styles.btn} ${styles.btnDangerGhost} ${styles.btnSmall}`} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div><div className={styles.panelBody}><Fields value={Object.fromEntries(fields.map(key => [key, item[key]])) as unknown as T} multiline={multiline as string[]} onChange={(next) => onChange(items.map((current, itemIndex) => itemIndex === index ? { ...current, ...next } : current))} /></div></section>)}<button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => items.length > 0 && onChange([...items, { ...items[items.length - 1] }])}>Add {label.slice(0, -1)}</button></div>;
}
