
export default function SkillBadge({ name, level = "Beginner" }) {
  return (
    <li>
      <span>{name}</span>
      <span> — {level}</span>
    </li>
  );
}
