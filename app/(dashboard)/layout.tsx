import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import styles from "./Layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles["dashboard-layout"]}>
      <Sidebar />
      <div className={styles["dashboard-main"]}>
        <Topbar />
        <main className={styles["dashboard-content"]}>
          {children}
        </main>
      </div>
    </div>
  );
}
