export interface NavItem {
  to: string;
  label: string;
}

/** Primary navigation, shown in the header (desktop) and the mobile menu. */
export const primaryNav: NavItem[] = [
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/admissions-aid", label: "Admissions & Aid" },
  { to: "/transfer", label: "Transfer" },
  { to: "/student-life", label: "Student Life" },
  { to: "/enigma", label: "Enigma" },
  { to: "/contact", label: "Contact" },
];
