import styles from "./portal.module.css";

// The portal design tokens (light values on `.portal`, dark values on
// `html[data-theme="dark"] .portal`) are scoped to the `.portal` class, so
// every /client route must render inside it. Without this wrapper the login
// page's labels and inputs resolve no variables and fall back to unstyled
// native form controls that ignore dark mode.
export default function ClientLayout({ children }: LayoutProps<"/client">) {
    return <div className={styles.portal}>{children}</div>;
}
