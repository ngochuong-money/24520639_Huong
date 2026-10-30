
import { Fragment, useId, useState } from "react";
import SkillBadge from "./SkillBadge";
import styles from "./DeveloperCard.module.css";

const defaultMetrics = {
  commits: 512,
  vdomNodes: 0,
  a11yScore: 100,
};

const defaultSkills = [
  { id: "sk-1", name: "React 19 Fiber", level: "Core" },
];

function getInitials(fullName) {
  const words = fullName.trim().split(/\s+/).filter(Boolean);

  return (
    words
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "?"
  );
}

function Avatar({ fullName, avatarUrl }) {
  const [failedUrl, setFailedUrl] = useState(null);

  const isSecureUrl =
    typeof avatarUrl === "string" &&
    /^https:\/\//i.test(avatarUrl);

  const showFallback =
    !isSecureUrl || failedUrl === avatarUrl;

  return (
    <span className={styles.avatar}>
      {showFallback ? (
        <span
          role="img"
          aria-label={`${fullName} avatar initials`}
        >
          {getInitials(fullName)}
        </span>
      ) : (
        <img
          src={avatarUrl}
          alt={`${fullName} avatar`}
          width={64}
          height={64}
          onError={() => setFailedUrl(avatarUrl)}
        />
      )}
    </span>
  );
}

export default function DeveloperCard({
  fullName = "Tran Vinh Khiem",
  role = "Senior Systems Architect • UIT S3T",
  avatarUrl = "",
  metrics = defaultMetrics,
  skills = defaultSkills,
}) {
  const headingId = useId();

  return (
    <article
      className={styles.card}
      aria-labelledby={headingId}
    >
      <header className={styles.header}>
        <Avatar
          fullName={fullName}
          avatarUrl={avatarUrl}
        />

        <hgroup>
          <h2 id={headingId}>{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>

      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>

      <ul
        className={styles.skills}
        aria-label="Engineered Skills"
      >
        {skills.map((skill) => (
          <SkillBadge
            key={skill.id}
            name={skill.name}
            level={skill.level}
          />
        ))}
      </ul>
    </article>
  );
}
