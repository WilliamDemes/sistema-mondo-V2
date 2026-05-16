import BarraLateral from "@/components/layout/BarraLateral";
import BarraSuperior from "@/components/layout/BarraSuperior";
import styles from "./Layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles["dashboard-layout"]}>
      <BarraLateral />
      <div className={styles["dashboard-main"]}>
        <BarraSuperior />
        <main className={styles["dashboard-content"]}>
          {children}
        </main>
      </div>
    </div>
  );
}
