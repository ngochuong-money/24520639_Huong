/**
 * Fictional dating-card profiles for HW4. Any resemblance to real people is coincidental.
 * id is URL-safe and stable (used by swipes).
 */
const avatarAlt = (name, color) => `Illustrated placeholder avatar showing the initials of ${name} on a ${color} background.`;

export const profiles = Object.freeze([
  { id: 'linh-nguyen', name: 'Linh', age: 24, city: 'Ho Chi Minh City', bio: 'Support main who always pings before engaging.', interests: ['MOBA', 'bubble tea', 'night markets'], color: 'teal' },
  { id: 'minh-tran', name: 'Minh', age: 27, city: 'Da Nang', bio: 'Will carry you in ranked, will not carry your groceries.', interests: ['FPS', 'surfing', 'coffee'], color: 'purple' },
  { id: 'thao-le', name: 'Thao', age: 22, city: 'Hanoi', bio: 'Speedrunner. Looking for someone who respects a no-damage run.', interests: ['speedruns', 'pho', 'piano'], color: 'amber' },
  { id: 'khoa-pham', name: 'Khoa', age: 29, city: 'Can Tho', bio: 'Caster voice in real life too. Sorry in advance.', interests: ['casting', 'fishing', 'karaoke'], color: 'green' },
  { id: 'an-vo', name: 'An', age: 25, city: 'Hue', bio: 'Builds cozy farms in every survival game.', interests: ['sim games', 'gardening', 'tea'], color: 'rose' },
  { id: 'bao-dang', name: 'Bao', age: 26, city: 'Ho Chi Minh City', bio: 'Referee by day, appeal tribunal fan by night.', interests: ['rules', 'chess', 'badminton'], color: 'slate' },
  { id: 'vy-huynh', name: 'Vy', age: 23, city: 'Nha Trang', bio: 'Clutches 1v3 rounds, panics at group chats.', interests: ['tactical shooters', 'beach', 'photography'], color: 'sky' },
  { id: 'quan-bui', name: 'Quan', age: 28, city: 'Hai Phong', bio: 'Theorycrafter with a spreadsheet for everything, including dates.', interests: ['strategy', 'spreadsheets', 'cooking'], color: 'indigo' },
].map((p) => Object.freeze({
  ...p,
  interests: Object.freeze(p.interests),
  avatar: `/avatars/${p.id}.svg`,
  avatarAlt: avatarAlt(p.name, p.color),
})));
