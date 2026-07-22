import Image from "next/image";
import { siteConfig } from "@/data/seo";
import { formatCopyrightYear } from "@/lib/copyright";
import styles from "./footer.module.css";

export function Footer() {
  const copyrightYear = formatCopyrightYear(new Date().getFullYear());

  return (
    <footer className={`${styles.footer} mb-20 mt-8 md:mb-0`}>
      <div className={styles.copyright}>
        <span>© {copyrightYear} {siteConfig.personName}</span>
      </div>

      <div className={styles.environment} aria-hidden="true">
        <div className={styles.ground} />
        <Image
          src="/assets/pixel-ornaments/footer/footer_left_environment.png"
          alt=""
          width={240}
          height={128}
          unoptimized
          className={`${styles.artwork} ${styles.leftEnvironment}`}
        />
        <Image
          src="/assets/pixel-ornaments/footer/footer_utility_cluster.png"
          alt=""
          width={420}
          height={220}
          unoptimized
          className={`${styles.artwork} ${styles.utilityCluster}`}
        />
        <Image
          src="/assets/pixel-ornaments/footer/footer_mobile_utility_cluster.png"
          alt=""
          width={260}
          height={160}
          unoptimized
          className={`${styles.artwork} ${styles.mobileUtilityCluster}`}
        />
      </div>
    </footer>
  );
}
