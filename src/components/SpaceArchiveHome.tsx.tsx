import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./HomePage.css";

type Region = "moon" | "mars" | "beyond";
type Filter = "all" | Region;

type Archive = {
  id: string;
  name: string;
  region: Region;
  kind: string;
  location: string;
  era: string;
  emblem: string;
  accent: string;
  summary: string;
  story: string;
  legacy: string;
};

// Adapted from the team's mission-device list. Each entry becomes one book.
const ARCHIVES: Archive[] = [
  {
    id: "apollo-modules", name: "Apollo Lunar Modules", region: "moon",
    kind: "Lunar landing craft", location: "The Moon", era: "Apollo programme",
    emblem: "◈", accent: "#7fcfff",
    summary: "The descent stages of Apollo's lunar modules remained on the Moon after astronauts departed.",
    story: "Apollo astronauts travelled to the lunar surface in Lunar Modules, including Apollo 11's Eagle. The ascent stages carried the crews away, but the descent stages stayed behind. They had also served as platforms for those departures.",
    legacy: "These remaining stages mark the places where people explored another world.",
  },
  {
    id: "sojourner", name: "Sojourner Rover", region: "mars",
    kind: "Robotic rover", location: "Mars", era: "1997",
    emblem: "✧", accent: "#ffb377",
    summary: "The first rover on Mars, delivered by the Pathfinder lander in 1997.",
    story: "Sojourner travelled to Mars aboard the Pathfinder mission in 1997. This small robotic rover became the first rover to operate on the Martian surface. It is now permanently parked on Mars.",
    legacy: "Sojourner helped open the era of robotic surface exploration on Mars.",
  },
  {
    id: "lrv", name: "Lunar Roving Vehicles", region: "moon",
    kind: "Electric moon buggies", location: "The Moon", era: "Apollo programme",
    emblem: "✦", accent: "#b4d5ff",
    summary: "Three electric Moon buggies drove astronauts across the lunar surface and remain parked there.",
    story: "Astronauts used Lunar Roving Vehicles to travel farther across the Moon. Three of these electric vehicles were left on the lunar surface when their crews returned home.",
    legacy: "The rovers are reminders of how people extended the reach of lunar exploration.",
  },
  {
    id: "spirit-opportunity", name: "Spirit & Opportunity", region: "mars",
    kind: "Twin robotic rovers", location: "Mars", era: "Mars exploration",
    emblem: "✶", accent: "#ff9a87",
    summary: "Twin rovers that explored Mars for years before becoming inactive monuments.",
    story: "Spirit and Opportunity were twin robotic rovers. Both operated on Mars for years, exploring their surroundings and sending discoveries home. They are no longer active.",
    legacy: "Their journeys show how much science long-lived robotic explorers can accomplish.",
  },
  {
    id: "alsep", name: "ALSEP Scientific Packages", region: "moon",
    kind: "Scientific instruments", location: "The Moon", era: "Apollo programme",
    emblem: "✺", accent: "#92c6ff",
    summary: "Scientific packages, including seismometers and retroreflectors, left to study the Moon.",
    story: "The Apollo Lunar Surface Experiments Packages included instruments such as seismometers and retroreflectors. Astronauts deployed them on the lunar surface so science could continue after the crews departed.",
    legacy: "They transformed brief human visits into longer-lasting scientific investigations.",
  },
  {
    id: "viking", name: "Viking 1 & 2 Landers", region: "mars",
    kind: "Robotic landers", location: "Mars", era: "1976",
    emblem: "✥", accent: "#ffc18d",
    summary: "The first U.S. landers to operate successfully on Mars, in 1976.",
    story: "Viking 1 and Viking 2 successfully operated on Mars in 1976. The landers remain at the places where they touched down, silent reminders of an early milestone in Martian exploration.",
    legacy: "Their successful landings helped establish Mars as a destination for robotic science.",
  },
  {
    id: "surveyor", name: "Surveyor Landers", region: "moon",
    kind: "Robotic lunar probes", location: "The Moon", era: "1960s",
    emblem: "◇", accent: "#70d8ff",
    summary: "Robotic lunar probes from the 1960s that demonstrated soft landings were possible.",
    story: "Before the Apollo lunar landings, Surveyor probes were sent to the Moon. Their mission helped show that spacecraft could make controlled, soft landings on the lunar surface.",
    legacy: "These robotic pioneers helped prepare the way for later lunar exploration.",
  },
  {
    id: "phoenix-insight", name: "Phoenix & InSight", region: "mars",
    kind: "Science landers", location: "Mars", era: "Mars exploration",
    emblem: "✳", accent: "#ffad9e",
    summary: "Phoenix investigated water ice; InSight listened for marsquakes. Both eventually lost power.",
    story: "Phoenix examined water ice on Mars. InSight turned its attention inward, listening for marsquakes. Both landers eventually lost power after carrying out their scientific work.",
    legacy: "Their different instruments reveal that a planet can be explored both on its surface and below it.",
  },
  {
    id: "ingenuity", name: "Ingenuity Helicopter", region: "mars",
    kind: "Robotic helicopter", location: "Mars", era: "Mars exploration",
    emblem: "✴", accent: "#ff8e75",
    summary: "The first aircraft to make powered flights on another planet; now a stationary artifact.",
    story: "Ingenuity became the first aircraft to achieve powered flight on another planet. After sustaining rotor damage, it could no longer fly and became a stationary artifact on Mars.",
    legacy: "Its flight experiments demonstrated a new way to explore distant worlds.",
  },
  {
    id: "dawn", name: "Dawn Spacecraft", region: "beyond",
    kind: "Asteroid-belt explorer", location: "Orbit around Ceres", era: "Vesta & Ceres",
    emblem: "✵", accent: "#d9baff",
    summary: "Mapped Vesta and Ceres before running out of fuel; now in an unpowered orbit around Ceres.",
    story: "Dawn travelled to the asteroid belt to map Vesta and Ceres. When its fuel ran out, the mission ended. The spacecraft remains in orbit around Ceres without power for further manoeuvres.",
    legacy: "Its journey connected the stories of two remarkable bodies in the asteroid belt.",
  },
  {
    id: "near", name: "NEAR Shoemaker", region: "beyond",
    kind: "Asteroid spacecraft", location: "Asteroid 433 Eros", era: "Asteroid exploration",
    emblem: "✷", accent: "#d6a7f0",
    summary: "The first spacecraft to orbit and land on an asteroid, now resting on 433 Eros.",
    story: "NEAR Shoemaker explored the asteroid 433 Eros, becoming the first spacecraft to orbit and then land on an asteroid. It rests on the asteroid's surface.",
    legacy: "It showed that small bodies in the solar system could be visited up close.",
  },
  {
    id: "pioneer", name: "Pioneer 10 & 11", region: "beyond",
    kind: "Deep-space probes", location: "Outbound deep space", era: "Outer planets",
    emblem: "✹", accent: "#bfaaff",
    summary: "Early probes that explored the outer planets and are now drifting away from the solar system.",
    story: "Pioneer 10 and Pioneer 11 were early deep-space probes that travelled outward to explore the outer planets. Their active work is over, but their spacecraft continue their journeys into distant space.",
    legacy: "They stand for humanity's earliest steps toward the distant reaches of the solar system.",
  },
  {
    id: "kepler", name: "Kepler Space Telescope", region: "beyond",
    kind: "Exoplanet telescope", location: "Earth-trailing solar orbit", era: "Exoplanet search",
    emblem: "✧", accent: "#e1c4ff",
    summary: "An exoplanet-hunting telescope that ran out of fuel and now drifts in an Earth-trailing orbit.",
    story: "Kepler searched for planets around stars beyond our solar system. After running out of fuel, it could no longer continue its mission and was left drifting in an orbit that trails Earth around the Sun.",
    legacy: "Its work changed how we think about planets in the wider universe.",
  },
];

/*
 * Original, locally rendered spacecraft illustrations for the 13 book covers.
 * These are intentionally storybook-style silhouettes, not NASA photographs
 * or precise engineering diagrams. No extra libraries or image URLs needed.
 */
const COVER_DETAILS: Record<string, { subtitle: string; volume: string }> = {
  "apollo-modules": { subtitle: "The silent lunar guardian", volume: "01" },
  "sojourner": { subtitle: "A tiny wanderer on Mars", volume: "02" },
  "lrv": { subtitle: "Wheels across the Moon", volume: "03" },
  "spirit-opportunity": { subtitle: "The restless twin explorers", volume: "04" },
  "alsep": { subtitle: "Listening to the Moon", volume: "05" },
  "viking": { subtitle: "The first Martian outposts", volume: "06" },
  "surveyor": { subtitle: "Before the first footsteps", volume: "07" },
  "phoenix-insight": { subtitle: "The secrets beneath the dust", volume: "08" },
  "ingenuity": { subtitle: "The first wings on Mars", volume: "09" },
  "dawn": { subtitle: "Between Vesta and Ceres", volume: "10" },
  "near": { subtitle: "A visitor to asteroid Eros", volume: "11" },
  "pioneer": { subtitle: "Messages to the stars", volume: "12" },
  "kepler": { subtitle: "The hunter of distant worlds", volume: "13" },
};

function SolarPanel({ x, y, w, h, rotation = 0 }: {
  x: number; y: number; w: number; h: number; rotation?: number;
}) {
  return (
    <g transform={`rotate(${rotation} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} rx="2" fill="#152c50" stroke="#f6dfad" strokeWidth="2" />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} fill="#356ca3" opacity=".75" />
      {[1, 2, 3, 4].map((i) => (
        <line key={i} x1={x + (w * i) / 5} y1={y + 3} x2={x + (w * i) / 5} y2={y + h - 3} stroke="#b6e8ff" strokeWidth=".8" opacity=".7" />
      ))}
      <line x1={x + 3} y1={y + h / 2} x2={x + w - 3} y2={y + h / 2} stroke="#b6e8ff" strokeWidth=".8" opacity=".65" />
    </g>
  );
}

function Wheel({ x, y, r = 10 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 2} fill="#18253e" stroke="#c9d8df" strokeWidth="2" />
      <circle cx={x} cy={y} r={r - 3} fill="#39516d" stroke="#abcbd9" strokeWidth="1" />
      <circle cx={x} cy={y} r="2" fill="#fff1c2" />
      <path d={`M ${x-r+2} ${y} H ${x+r-2} M ${x} ${y-r+2} V ${y+r-2}`} stroke="#bdcfe0" opacity=".7" strokeWidth="1" />
    </g>
  );
}

function Dish({ x, y, scale = 1, turn = 0 }: { x: number; y: number; scale?: number; turn?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
      <path d="M -20 -8 Q -1 22 21 -8 Q 0 1 -20 -8" fill="#dbe6e9" stroke="#8a9bb0" strokeWidth="2" />
      <path d="M -16 -6 Q 0 9 17 -6" fill="none" stroke="#fff0bc" strokeWidth="1.5" />
      <path d="M 0 5 V -16" stroke="#dce0e6" strokeWidth="2" />
      <circle cx="0" cy="-17" r="2.4" fill="#ffd88a" />
    </g>
  );
}

function DeviceIllustration({ id, region }: { id: string; region: Region }) {
  const isMoon = region === "moon";
  const isMars = region === "mars";
  const metal = "#e8e2d4";
  const gold = "#f6c977";
  const dark = "#43506d";

  let machine: ReactNode;
  switch (id) {
    case "apollo-modules":
      machine = <g>
        <path d="M84 118 L65 151 M155 118 L174 151 M105 122 L96 153 M141 122 L148 153" stroke={gold} strokeWidth="4" />
        <path d="M52 152 H80 M164 152 H189 M86 154 H108 M137 154 H160" stroke="#fff2ca" strokeWidth="3" strokeLinecap="round" />
        <path d="M81 89 L98 70 L147 70 L164 89 L152 127 H93 Z" fill="#b58a42" stroke="#ffe2a2" strokeWidth="3" />
        <path d="M89 98 H157 M98 109 H148 M105 122 H143" stroke="#f9e7aa" strokeWidth="2" opacity=".8" />
        <path d="M99 68 L106 45 L142 45 L149 68 L136 84 H110 Z" fill={metal} stroke={gold} strokeWidth="2" />
        <path d="M106 50 L114 47 L121 63 L111 64 Z M130 46 L142 52 L138 64 L126 62 Z" fill="#7ea8c7" />
        <path d="M143 45 L159 29 M100 51 L85 36" stroke="#f8dfb9" strokeWidth="2" />
        <circle cx="161" cy="28" r="4" fill={gold} />
        <rect x="114" y="85" width="17" height="14" rx="2" fill="#d9d7cb" stroke="#fff1c0" />
        <path d="M104 86 L94 125 L82 132 M143 87 L154 124 L168 132" stroke="#f9d783" strokeWidth="2" />
      </g>;
      break;
    case "lrv":
      machine = <g>
        <Wheel x={71} y={145} r={17} /><Wheel x={169} y={145} r={17} />
        <path d="M62 129 H176 L164 114 H91 L79 120 Z" fill="#b9b9a9" stroke="#fff2c7" strokeWidth="3" />
        <path d="M83 114 V92 M108 114 V93 M144 112 V89" stroke={metal} strokeWidth="3" />
        <path d="M80 91 H118 V108 H80 Z M121 93 H154 V109 H121 Z" fill="#f4d4a0" stroke={dark} strokeWidth="2" />
        <path d="M83 89 L70 78 L72 65 M152 87 L165 64" stroke="#d8dde3" strokeWidth="3" fill="none" />
        <SolarPanel x={133} y={67} w={48} h={14} rotation={-14} />
        <path d="M168 65 L174 45" stroke={metal} strokeWidth="2" />
        <Dish x={175} y={39} scale={.52} turn={-18} />
        <path d="M65 124 L176 124" stroke="#ffe9b4" strokeWidth="2" />
      </g>;
      break;
    case "alsep":
      machine = <g>
        <path d="M34 147 H205" stroke="#c0d6e2" strokeWidth="2" opacity=".8" />
        <rect x="68" y="102" width="65" height="42" rx="4" fill="#d7dfdc" stroke="#f9e7bd" strokeWidth="3" />
        <rect x="77" y="110" width="48" height="25" rx="2" fill="#526e8f" />
        <path d="M85 110 V135 M101 110 V135 M117 110 V135 M77 121 H125" stroke="#cceaff" strokeWidth="1" />
        <path d="M102 99 V57 M102 57 L91 41 M102 57 L112 37" stroke="#ebf4f7" strokeWidth="3" />
        <circle cx="102" cy="55" r="7" fill="#ffd19b" stroke="#fff3d3" strokeWidth="2" />
        <rect x="153" y="112" width="39" height="28" rx="5" fill="#e6dbc2" stroke="#f5ce89" strokeWidth="3" />
        <path d="M169 112 V77" stroke={metal} strokeWidth="3" />
        <Dish x={170} y={75} scale={.76} />
        <path d="M131 140 Q145 154 154 139 M68 142 Q51 150 39 138" fill="none" stroke={gold} strokeWidth="2" strokeDasharray="4 3" />
        <rect x="29" y="119" width="36" height="20" rx="4" fill="#f5ebd5" stroke="#c3b28b" strokeWidth="2" />
      </g>;
      break;
    case "surveyor":
      machine = <g>
        <path d="M115 100 L60 156 M127 102 L189 154 M120 100 L120 155" stroke="#eef0e6" strokeWidth="4" />
        <path d="M48 157 H74 M175 155 H202 M104 156 H136" stroke={gold} strokeWidth="4" strokeLinecap="round" />
        <path d="M100 82 L115 60 L140 81 L134 111 L108 113 Z" fill="#b4bec6" stroke="#f8d99d" strokeWidth="3" />
        <path d="M110 76 L119 59 L133 78 L128 94 H113 Z" fill="#647994" />
        <path d="M124 60 V35" stroke={metal} strokeWidth="3" />
        <Dish x={124} y={37} scale={1.2} turn={-15} />
        <path d="M105 90 L82 65 M134 89 L162 69" stroke="#eef0e6" strokeWidth="2" />
        <circle cx="80" cy="65" r="5" fill="#d8e8f2" />
        <rect x="145" y="87" width="23" height="16" fill="#af8d5c" stroke="#fff2c8" strokeWidth="2" transform="rotate(12 155 94)" />
      </g>;
      break;
    case "sojourner":
      machine = <g>
        {[69, 104, 143].map((x) => <Wheel key={`b${x}`} x={x} y={142} r={11} />)}
        {[84, 125, 164].map((x) => <Wheel key={`f${x}`} x={x} y={149} r={11} />)}
        <path d="M59 131 L72 117 H157 L177 136 L156 140 H78 Z" fill="#edd2a2" stroke="#fff3d4" strokeWidth="3" />
        <SolarPanel x={65} y={103} w={97} h={25} rotation={-4} />
        <rect x="101" y="92" width="20" height="11" fill="#f4e6cc" stroke={dark} strokeWidth="2" />
        <circle cx="108" cy="96" r="2.3" fill="#192e49" />
        <circle cx="116" cy="96" r="2.3" fill="#192e49" />
        <path d="M120 92 V75" stroke={metal} strokeWidth="2" />
        <circle cx="120" cy="74" r="4" fill={gold} />
        <path d="M80 130 L74 141 M103 127 L104 141 M148 129 L157 142" stroke="#c1cad3" strokeWidth="2" />
      </g>;
      break;
    case "spirit-opportunity":
      machine = <g>
        {[65, 97, 148, 182].map((x) => <Wheel key={x} x={x} y={149} r={11} />)}
        <path d="M58 135 L90 119 L166 119 L188 136 H58" fill="#c7c8bd" stroke="#fff0d0" strokeWidth="3" />
        <SolarPanel x={51} y={105} w={138} h={23} rotation={-2} />
        <path d="M123 105 V58 M114 78 H137" stroke="#e9e4d8" strokeWidth="4" />
        <rect x="111" y="51" width="28" height="20" rx="4" fill="#ebdfc9" stroke="#fff2d0" strokeWidth="2" />
        <circle cx="119" cy="60" r="4" fill="#34506e" /><circle cx="131" cy="60" r="4" fill="#34506e" />
        <path d="M137 77 L161 60 M91 124 L73 147 M157 125 L181 147" stroke={metal} strokeWidth="2.5" />
        <Dish x={163} y={58} scale={.57} turn={22} />
      </g>;
      break;
    case "viking":
      machine = <g>
        <path d="M107 105 L69 150 M143 107 L183 150 M125 110 L123 154" stroke={metal} strokeWidth="4" />
        <path d="M58 153 H84 M172 153 H197 M110 156 H136" stroke={gold} strokeWidth="3" />
        <path d="M89 88 Q121 68 157 88 L149 111 H101 Z" fill="#eadbbf" stroke="#fff4d6" strokeWidth="3" />
        <ellipse cx="123" cy="90" rx="40" ry="14" fill="#f1d2a1" stroke="#fff4d6" strokeWidth="2" />
        <path d="M124 78 V47" stroke="#ecece4" strokeWidth="3" />
        <Dish x={125} y={42} scale={.9} turn={-12} />
        <rect x="104" y="100" width="36" height="18" rx="2" fill="#b07d54" stroke="#ffe5ab" strokeWidth="2" />
        <circle cx="110" cy="108" r="3" fill="#43495a" /><circle cx="134" cy="108" r="3" fill="#43495a" />
      </g>;
      break;
    case "phoenix-insight":
      machine = <g>
        <ellipse cx="67" cy="115" rx="43" ry="24" fill="#416b89" stroke="#e6e7d7" strokeWidth="3" />
        <ellipse cx="67" cy="115" rx="33" ry="17" fill="#203e62" stroke="#78a8c7" strokeWidth="1" />
        <ellipse cx="172" cy="115" rx="44" ry="25" fill="#416b89" stroke="#e6e7d7" strokeWidth="3" />
        <ellipse cx="172" cy="115" rx="34" ry="18" fill="#203e62" stroke="#78a8c7" strokeWidth="1" />
        <rect x="101" y="101" width="40" height="29" rx="4" fill="#f5d9ad" stroke="#fff1d2" strokeWidth="3" />
        <path d="M111 100 V73 M128 102 V62" stroke="#f1eeea" strokeWidth="3" />
        <circle cx="128" cy="59" r="8" fill="#e9e2d3" stroke="#fff3da" strokeWidth="2" />
        <path d="M105 120 L90 147 M139 120 L153 145" stroke="#e5e2d5" strokeWidth="3" />
        <path d="M100 105 Q75 70 54 83" fill="none" stroke="#ebd9b2" strokeWidth="3" />
        <rect x="45" y="79" width="17" height="13" rx="2" fill="#d9c8b7" stroke="#fff1cc" strokeWidth="2" />
        <path d="M42 146 H171" stroke="#f6d6ad" strokeWidth="1.4" opacity=".7" />
      </g>;
      break;
    case "ingenuity":
      machine = <g>
        <path d="M119 92 V43" stroke="#e6e4de" strokeWidth="3.5" />
        <path d="M42 49 Q120 36 198 49 M51 56 Q120 50 188 56" stroke="#fff1dc" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="120" cy="50" r="6" fill={gold} stroke="#fff5ce" strokeWidth="2" />
        <path d="M106 95 L97 144 M136 95 L146 144 M101 144 H84 M141 144 H160" stroke={metal} strokeWidth="4" strokeLinecap="round" />
        <rect x="98" y="88" width="46" height="33" rx="5" fill="#e6bf81" stroke="#fff1d0" strokeWidth="3" />
        <rect x="107" y="95" width="27" height="11" rx="2" fill="#34445b" />
        <path d="M104 116 L95 124 M138 116 L148 124" stroke="#e8e2d2" strokeWidth="3" />
        <circle cx="120" cy="113" r="5" fill="#7e9db3" />
        <path d="M160 83 Q182 79 194 92" fill="none" stroke="#f6d395" strokeWidth="2" strokeDasharray="5 5" />
      </g>;
      break;
    case "dawn":
      machine = <g>
        <SolarPanel x={20} y={74} w={77} h={53} rotation={-5} />
        <SolarPanel x={143} y={74} w={77} h={53} rotation={5} />
        <path d="M97 100 H144" stroke="#ddd6c7" strokeWidth="6" />
        <path d="M110 78 L130 78 L145 96 L132 116 L108 116 L96 97 Z" fill="#d7c08e" stroke="#fff0c5" strokeWidth="3" />
        <circle cx="120" cy="97" r="11" fill="#444c6f" stroke="#d6cfae" strokeWidth="2" />
        <path d="M120 78 L122 49" stroke="#f6e3bb" strokeWidth="2" />
        <Dish x={122} y={45} scale={.65} />
        <path d="M118 117 V140 M119 138 L128 146" stroke={metal} strokeWidth="2" />
      </g>;
      break;
    case "near":
      machine = <g>
        <path d="M14 150 Q39 105 76 139 Q112 157 99 170 H22 Z" fill="#827385" stroke="#e4c2af" strokeWidth="2" />
        <circle cx="49" cy="148" r="9" fill="#4d496b" /><circle cx="80" cy="154" r="5" fill="#49445e" />
        <g transform="translate(28 -12) rotate(-23 112 100)">
          <SolarPanel x={63} y={85} w={39} h={37} />
          <SolarPanel x={140} y={85} w={39} h={37} />
          <path d="M103 104 H140" stroke="#e6e7e6" strokeWidth="5" />
          <rect x="106" y="87" width="34" height="31" rx="3" fill="#d3ba8e" stroke="#fff3d8" strokeWidth="3" />
          <path d="M123 87 V57" stroke="#dcd6d5" strokeWidth="3" />
          <Dish x={123} y={53} scale={.64} />
        </g>
        <path d="M159 142 L190 130" stroke="#f5d4a8" strokeWidth="1" strokeDasharray="4 4" />
      </g>;
      break;
    case "pioneer":
      machine = <g>
        <g transform="rotate(-20 117 100)">
          <path d="M63 79 Q122 144 171 78 Q118 95 63 79" fill="#e0e6e3" stroke="#fff1c5" strokeWidth="3" />
          <path d="M74 81 Q118 120 160 82" fill="none" stroke="#839db1" strokeWidth="2" />
          <path d="M119 110 V57" stroke="#f6e2bd" strokeWidth="3" />
          <circle cx="119" cy="53" r="5" fill="#f5cf8a" />
          <rect x="100" y="114" width="36" height="23" rx="4" fill="#c6a365" stroke="#ffebc1" strokeWidth="3" />
          <path d="M102 124 L62 142 M134 124 L197 143" stroke="#dce7eb" strokeWidth="2" />
          <circle cx="61" cy="142" r="4" fill={gold} /><circle cx="197" cy="143" r="4" fill={gold} />
          <path d="M119 138 V163" stroke="#dce7eb" strokeWidth="2" />
        </g>
      </g>;
      break;
    case "kepler":
      machine = <g>
        <g transform="rotate(-28 125 102)">
          <path d="M95 55 L143 55 L160 138 L75 138 Z" fill="#d3d8da" stroke="#fff0bf" strokeWidth="3" />
          <path d="M99 66 H140 L148 123 H90 Z" fill="#717b92" />
          <path d="M87 53 H152 V73 H87 Z" fill="#d9c28d" stroke="#ffe9ae" strokeWidth="3" />
          <ellipse cx="119" cy="61" rx="33" ry="10" fill="#253d5d" stroke="#fce4b6" strokeWidth="3" />
          <ellipse cx="119" cy="61" rx="21" ry="6" fill="#536c8c" />
          <path d="M76 137 H160" stroke="#ffe3a7" strokeWidth="4" />
          <path d="M81 132 L56 152 M152 130 L178 150" stroke="#d8e3df" strokeWidth="3" />
          <SolarPanel x={147} y={90} w={48} h={24} rotation={20} />
        </g>
      </g>;
      break;
    default:
      machine = <g><circle cx="120" cy="99" r="42" fill={metal} /><path d="M87 102 L155 102" stroke={gold} strokeWidth="6" /></g>;
  }

  return (
    <svg className="sa-device-art" viewBox="0 0 240 185" role="img" aria-label={`${id.replaceAll("-", " ")} stylized spacecraft illustration`}>
      <circle cx="120" cy="88" r="82" fill={isMoon ? "#6ea9ec" : isMars ? "#ed835e" : "#ad88ee"} opacity=".13" />
      <circle cx="120" cy="88" r="70" fill="none" stroke="#fff3cf" strokeWidth=".7" strokeDasharray="3 7" opacity=".55" />
      {[ [29, 27], [196, 29], [213, 91], [20, 95], [158, 18] ].map(([x, y], i) => (
        <g key={i} stroke="#ffe6a1" opacity={i % 2 ? .72 : .98} strokeWidth="1.3">
          <path d={`M${x-4} ${y}h8 M${x} ${y-4}v8`} />
        </g>
      ))}
      {isMoon ? (
        <g>
          <path d="M0 165 Q44 144 85 158 Q146 140 240 161 V185 H0Z" fill="#8299ba" opacity=".78" />
          <path d="M0 170 Q93 147 159 170 Q204 152 240 167" fill="none" stroke="#d9edfc" strokeWidth="2" opacity=".67" />
          <ellipse cx="37" cy="171" rx="17" ry="5" fill="#576f93" /><ellipse cx="205" cy="173" rx="22" ry="6" fill="#536c94" />
        </g>
      ) : isMars ? (
        <g>
          <path d="M0 166 Q37 142 83 161 Q145 137 192 156 Q217 148 240 164 V185 H0Z" fill="#a85257" opacity=".85" />
          <path d="M0 171 Q96 153 158 170 Q216 158 240 171" fill="none" stroke="#ffc190" strokeWidth="2" opacity=".64" />
          <path d="M16 153 L31 142 L43 156 M184 149 L202 139 L217 152" stroke="#e99a80" strokeWidth="2" fill="none" />
        </g>
      ) : (
        <g>
          <circle cx="202" cy="145" r="33" fill="#867bc4" opacity=".23" stroke="#dfb4ff" strokeWidth="1" />
          <circle cx="40" cy="151" r="17" fill="#bcb2e6" opacity=".34" />
          <path d="M18 148 Q120 170 225 142" fill="none" stroke="#c8b4ed" strokeWidth="1" strokeDasharray="5 9" opacity=".55" />
        </g>
      )}
      <g filter="none" strokeLinejoin="round" strokeLinecap="round">{machine}</g>
      <path d="M29 37 Q49 8 76 14 M167 160 Q199 159 216 137" fill="none" stroke="#ffe2a2" strokeWidth="1" opacity=".45" />
    </svg>
  );
}

const FILTERS: { id: Filter; label: string; symbol: string }[] = [
  { id: "all", label: "All Archives", symbol: "✦" },
  { id: "moon", label: "The Moon", symbol: "☾" },
  { id: "mars", label: "Mars", symbol: "◉" },
  { id: "beyond", label: "Beyond", symbol: "✧" },
];

const REGION_LABEL: Record<Region, string> = {
  moon: "LUNAR ARCHIVE",
  mars: "MARTIAN ARCHIVE",
  beyond: "DEEP SPACE ARCHIVE",
};

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState(ARCHIVES[0].id);
  const [reading, setReading] = useState(false);

  const visible = useMemo(
    () => ARCHIVES.filter((book) => filter === "all" || book.region === filter),
    [filter]
  );
  const activeIndex = Math.max(0, visible.findIndex((book) => book.id === activeId));
  const activeBook = visible[activeIndex];

  const go = (step: number) => {
    const next = (activeIndex + step + visible.length) % visible.length;
    setActiveId(visible[next].id);
  };

  const changeFilter = (next: Filter) => {
    setFilter(next);
    const first = ARCHIVES.find((book) => next === "all" || book.region === next);
    if (first) setActiveId(first.id);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReading(false);
      if (reading) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reading, activeIndex, visible]);

  useEffect(() => {
    if (!reading) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [reading]);

  return (
    <div className="sa-home">
      <div className="sa-sky" aria-hidden="true" />
      <div className="sa-stars" aria-hidden="true" />

      <header className="sa-header">
        <div className="sa-brand" aria-label="Echoes Beyond Earth">
          <span className="sa-brand-mark">✧</span>
          <span className="sa-brand-name">ECHOES <small>BEYOND EARTH</small></span>
        </div>
        <span className="sa-header-line" aria-hidden="true" />
        <div className="sa-header-caption">NASA SPACE APPS 2026 <span>✦</span> THE EXPLORER'S LIBRARY</div>
      </header>

      <main className="sa-main">
        <div className="sa-hero">
          <div className="sa-eyebrow"><span>✦</span> THE CELESTIAL LIBRARY <span>✦</span></div>
          <h1>Stories written <em>among the stars</em></h1>
          <p>Thirteen forgotten explorers. Countless discoveries. Choose a book and uncover the machines humanity left beyond Earth.</p>
        </div>

        <div className="sa-filters" role="group" aria-label="Choose a destination">
          {FILTERS.map((item) => (
            <button
              className={`sa-filter ${filter === item.id ? "is-active" : ""}`}
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => changeFilter(item.id)}
            >
              <span className="sa-filter-symbol">{item.symbol}</span> {item.label}
            </button>
          ))}
        </div>

        <section className="sa-carousel-section" aria-label="Mission book carousel">
          <div className="sa-carousel-topline"><span>✧</span> SELECT AN ARCHIVE <span>✧</span></div>
          <div className="sa-carousel">
            <button className="sa-carousel-arrow sa-carousel-arrow--left" type="button" onClick={() => go(-1)} aria-label="Previous book">‹</button>

            <div className="sa-books-stage">
              <div className="sa-orbit sa-orbit--one" aria-hidden="true" />
              <div className="sa-orbit sa-orbit--two" aria-hidden="true" />
              {visible.map((book, index) => {
                let distance = index - activeIndex;
                if (distance > Math.floor(visible.length / 2)) distance -= visible.length;
                if (distance < -Math.floor(visible.length / 2)) distance += visible.length;
                if (Math.abs(distance) > 2) return null;
                const centered = distance === 0;
                const style = {
                  "--shift": `${distance * 205}px`,
                  "--shift-mobile": `${distance * 112}px`,
                  "--yaw": `${distance * -12}deg`,
                  "--scale": `${1 - Math.abs(distance) * 0.16}`,
                  "--lift": `${Math.abs(distance) * 20}px`,
                  "--accent": book.accent,
                  zIndex: 10 - Math.abs(distance),
                } as CSSProperties;

                return (
                  <button
                    key={book.id}
                    type="button"
                    className={`sa-book-slot ${centered ? "is-centered" : ""}`}
                    style={style}
                    onClick={() => centered ? setReading(true) : setActiveId(book.id)}
                    aria-label={`${centered ? "Read" : "Select"} ${book.name}`}
                    aria-pressed={centered}
                  >
                    <span className={`sa-book sa-book--${book.region}`}>
                      <span className="sa-book-spine" />
                      <span className="sa-book-ornament sa-book-ornament--tl">✧</span>
                      <span className="sa-book-ornament sa-book-ornament--tr">✧</span>
                      <span className="sa-book-ornament sa-book-ornament--bl">✧</span>
                      <span className="sa-book-ornament sa-book-ornament--br">✧</span>
                      <span className="sa-book-edition">{REGION_LABEL[book.region]}</span>
                      <span className="sa-book-volume">VOL. {COVER_DETAILS[book.id].volume} <span>✦</span> FIELD NOTES</span>
                      <span className="sa-book-art">
                        <span className="sa-cover-aura" />
                        <DeviceIllustration id={book.id} region={book.region} />
                      </span>
                      <span className="sa-book-title">{book.name}</span>
                      <span className="sa-book-divider">✦ ─────── ✦</span>
                      <span className="sa-book-kind">{COVER_DETAILS[book.id].subtitle}</span>
                      <span className="sa-book-bottom">✧ THE CELESTIAL ARCHIVE ✧</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button className="sa-carousel-arrow sa-carousel-arrow--right" type="button" onClick={() => go(1)} aria-label="Next book">›</button>
          </div>

          <div className="sa-index" aria-label="Book position">
            <span className="sa-index-count">{String(activeIndex + 1).padStart(2, "0")}</span>
            <span className="sa-index-track" />
            <span className="sa-index-total">{String(visible.length).padStart(2, "0")}</span>
          </div>
          <div className="sa-hint">← SELECT A BOOK →</div>
        </section>

        <section className={`sa-summary sa-summary--${activeBook.region}`} aria-live="polite" key={activeBook.id}>
          <div className="sa-summary-sigil" aria-hidden="true"><span>{activeBook.emblem}</span></div>
          <div className="sa-summary-copy">
            <div className="sa-summary-kicker"><span>✦</span> {REGION_LABEL[activeBook.region]} <span className="sa-summary-separator">/</span> {activeBook.kind}</div>
            <h2>{activeBook.name}</h2>
            <p>{activeBook.summary}</p>
          </div>
          <button className="sa-read-button" type="button" onClick={() => setReading(true)}>
            <span>▤</span> Open this book <span>→</span>
          </button>
        </section>
      </main>

      <footer className="sa-footer"><span>✧</span> A JOURNEY THROUGH HUMANITY'S SPACE LEGACY <span>✧</span></footer>

      {reading && (
        <div className="sa-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setReading(false);
        }}>
          <div className={`sa-dialog sa-dialog--${activeBook.region}`} role="dialog" aria-modal="true" aria-labelledby="sa-dialog-title">
            <button type="button" className="sa-dialog-close" onClick={() => setReading(false)} aria-label="Close book">×</button>
            <div className="sa-dialog-header"><span>✦</span> THE CELESTIAL ARCHIVE <span>✦</span></div>
            <div className="sa-open-book">
              <div className="sa-page sa-page--left">
                <div className="sa-page-label">{REGION_LABEL[activeBook.region]}</div>
                <div className="sa-page-device-art" aria-hidden="true">
                  <DeviceIllustration id={activeBook.id} region={activeBook.region} />
                </div>
                <h2 id="sa-dialog-title">{activeBook.name}</h2>
                <div className="sa-page-ornament">✧ ───────── ✧</div>
                <p className="sa-page-lead">{activeBook.summary}</p>
                <span className="sa-page-number">I</span>
              </div>
              <div className="sa-page sa-page--right">
                <div className="sa-page-label">MISSION RECORD</div>
                <h3>The story</h3>
                <p>{activeBook.story}</p>
                <h3>Why it matters</h3>
                <p>{activeBook.legacy}</p>
                <div className="sa-facts"><span><b>TYPE</b>{activeBook.kind}</span><span><b>LOCATION</b>{activeBook.location}</span><span><b>ERA</b>{activeBook.era}</span></div>
                <span className="sa-page-number">II</span>
              </div>
            </div>
            <div className="sa-dialog-actions">
              <button type="button" onClick={() => go(-1)}>← Previous archive</button>
              <span>{activeIndex + 1} / {visible.length}</span>
              <button type="button" onClick={() => go(1)}>Next archive →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
